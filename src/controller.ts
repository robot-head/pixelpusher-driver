import { StripPacket, macString, ipString } from "./wire";
import dgram from "dgram";

export default class PixelPusher {
  constructor(broadcast) {
    this.group_id = broadcast.group_ordinal;
    this.controller_id = broadcast.controller_ordinal;
    this.socket = dgram.createSocket("udp4");

    this.updateFromBroadcast(broadcast);

    this.strips = [];
    this.correction = [];

    this.last_packet = undefined;
    this.packet_number = 0;
    this.color_correction = [0xff, 0xe0, 0x8c];
    this.color_temp = [0xff, 0xff, 0xff];
    this._computeCorrection();
  }

  _computeCorrection() {
    this.correction = this.color_temp.map(
      (c, i) => this.color_correction[i] * c / 0xffff
    );
  }

  setColorTemperature(c) {
    this.color_temp = [(c >> 16) & 0xff, (c >> 8) & 0xff, (c >> 0) & 0xff];
    this._computeCorrection();
  }

  setColorCorrection(c) {
    this.color_correction = [
      (c >> 16) & 0xff,
      (c >> 8) & 0xff,
      (c >> 0) & 0xff
    ];
    this._computeCorrection();
  }

  applyCorrection(colorbuf) {
    for (let i = 0; i < colorbuf.length; i++) {
      colorbuf[i] *= this.correction[i % 3];
    }
  }

  updateFromBroadcast(broadcast) {
    this.updateVariables(broadcast);

    //network
    const ip = ipString(broadcast);
    this.mac = macString(broadcast);
    this.ip = ip;
    this.port = broadcast.my_port || 9897;

    // controller info
    this.pusher_flags = broadcast.pusher_flags;
    this.hardware_rev = broadcast.hardware_rev;
    this.software_rev = broadcast.software_rev;

    this.strips_attached = broadcast.strips_attached;
    this.pixels_per_strip = broadcast.pixels_per_strip;
  }

  updateVariables(broadcast) {
    this.delta_sequence = broadcast.delta_sequence;
    this.update_period = broadcast.update_period;
    this.max_strips_per_packet = broadcast.max_strips_per_packet;
    this.last_ping_at = Date.now();
  }

  setStrip(strip, colorbuf) {
    this.applyCorrection(colorbuf);
    this.strips.push([strip, colorbuf]);
  }

  _sendPacket() {
    if (this.strips.length == 0) return;
    const num_strips = Math.min(this.max_strips_per_packet, this.strips.length);
    const num_pixels = this.pixels_per_strip;

    let packet = Buffer.alloc(4 + num_strips * (3 * num_pixels + 1));
    let offset = 0;

    offset = packet.writeUInt32LE(this.packet_number++, offset);

    for (let strip_idx = 0; strip_idx < num_strips; strip_idx++) {
      const [strip, colorbuf] = this.strips.shift();
      offset = packet.writeUInt8(strip, offset);
      for (let i = 0; i < num_pixels * 3; i++) {
        offset = packet.writeUInt8(colorbuf[i], offset);
      }
    }

    this.socket.send(packet, this.port, this.ip, err => {
      if (err) console.log("error sending pixels");
    });
  }

  sendloop() {
    if (this.strips.length == 0) {
      return;
    }

    const start = process.hrtime();
    this._sendPacket();
    const [sec, ns] = process.hrtime(start);
    const total_ms = (sec * 1e9 + ns) / 1000;
    setTimeout(() => this.sendloop(), this.update_period - total_ms);
  }

  sync() {
    this.sendloop();
  }

  toString() {
    return (
      `PixelPusher ${this.group_id}-${this.controller_id}\n` +
      `MAC ${this.mac} IP ${this.ip}:${this.port}\n` +
      `rev ${this.hardware_rev} (hw) ${this.software_rev} (sw)\n` +
      `${this.pixels_per_strip} pixels/strip, ${this.strips_attached} strips`
    );
  }
}
