import { createSocket, Socket, AddressInfo } from "dgram";
import { EventEmitter } from "events";
import { clearInterval } from "timers";

import PixelPusher from "./controller";
import PusherBroadcast, { DeviceType, macString } from "./wire";

const LISTENER_SOCKET_PORT = 7331;
const CONTROLLER_TIMEOUT_THRESHOLD = 5000;
const TIMEOUT_INTERVAL = 1000;

export default class PixelPusherRegistry extends EventEmitter {
  prune_check: NodeJS.Timer;
  registry: Map<string, PixelPusher>;
  socket: Socket;

  constructor() {
    super();
    this.registry = new Map();
    this.socket = createSocket("udp4");

    this.socket.on("message", (message: Buffer, rinfo: AddressInfo) => {
      const broadcast_struct = PusherBroadcast();
      broadcast_struct._setBuff(message);

      const broadcast = broadcast_struct.fields;

      if (broadcast.devicetype != DeviceType.PIXELPUSHER) return;

      const mac = macString(broadcast);

      let controller = this.registry.get(mac);

      if (controller === undefined) {
        controller = new PixelPusher(broadcast);
        this.registry.set(mac, controller);
        this.emit("discovered", controller);
        console.info(
          "Found a pixelpusher!\n" + "----------------------" + `${controller}`
        );
      } else {
        controller.updateVariables(broadcast);
      }
    });
    this.socket.on("listening", (): void => {
      console.info(
        `Listening for pixelpushers on udp://*:${this.socket.address().port}`
      );
    });
  }

  prune(): void {
    const now = Date.now();
    for (const [mac, controller] of this.registry) {
      if (now - controller.last_ping_at > CONTROLLER_TIMEOUT_THRESHOLD) {
        console.info(`Haven't heard from ${mac} in a while, pruning`);
        this.registry.delete(mac);
        this.emit("pruned", controller);
      }
    }
  }

  start() {
    this.socket.bind(LISTENER_SOCKET_PORT);
    this.prune_check = setInterval(() => this.prune(), TIMEOUT_INTERVAL);
  }

  stop() {
    this.socket.close();
    clearInterval(this.prune_check);
  }
}
