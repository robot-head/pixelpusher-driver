import dgram from 'dgram';
import { EventEmitter } from 'events';
import PixelPusher from './controller';
import PusherBroadcast, { DeviceType, macString } from './wire';

const LISTENER_SOCKET_PORT = 7331;
const CONTROLLER_TIMEOUT_THRESHOLD = 5000;
const TIMEOUT_INTERVAL = 1000;

export default class PixelPusherRegistry extends EventEmitter {
    constructor() {
        super();
        this.registry = new Map();
        this.socket = dgram.createSocket('udp4');

        this.socket.on('message', (message, rinfo) => {
            message.type = PusherBroadcast;
            let broadcast = message.deref();

            if (broadcast.devicetype != DeviceType.PIXELPUSHER)
                return;

            const mac = macString(broadcast);

            let controller = this.registry.get(mac);

            if (controller === undefined) {
                controller = new PixelPusher(broadcast);
                this.registry.set(mac, controller);
                this.emit('discovered', controller);
                console.info("Found a pixelpusher!\n"+
                            "----------------------"+
                            `${controller}`);
            } else {
                controller.updateVariables(broadcast);
            }
        });
        this.socket.on('listening', () => {
            console.info(`Listening for pixelpushers on udp://*:${this.socket.address().port}`);
        });
    }

    prune() {
        const now = Date.now();
        for (let [mac, controller] of this.registry) {
            if (now - controller.last_ping_at > CONTROLLER_TIMEOUT_THRESHOLD) {
                console.info(`Haven't heard from ${mac} in a while, pruning`);
                this.registery.delete(mac);
                this.emit('pruned', controller);
            }
        }
    }

    start() {
        this.socket.bind(LISTENER_SOCKET_PORT);
        this.prune_check = setInterval(() => this.prune(), TIMEOUT_INTERVAL);
    }

    stop() {
        this.socket.close();
        cancelInterval(this.prune_check);
    }
}
