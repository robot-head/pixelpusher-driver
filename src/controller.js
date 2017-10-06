import { StripPacket, macString } from './wire';
import dgram from 'dgram';
import ref from 'ref';

export default class PixelPusher {
    constructor(broadcast) {
        this.group_id = broadcast.group_ordinal;
        this.controller_id = broadcast.controller_ordinal;
        this.socket = dgram.createSocket('udp4');

        this.updateFromBroadcast(broadcast);

        this.strips = [];
        this.last_packet = undefined;
        this.packet_number = 0;
    }

    updateFromBroadcast(broadcast) {
        this.updateVariables(broadcast);

        //network
        const ip = broadcast.ip.toArray().map((octet) => octet.toString()).join('.');
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
        this.strips.push([strip, colorbuf]);
    }

    _sendPacket() {
        if (this.strips.length == 0)
            return;
        const strips_in_packet = Math.min(this.max_strips_per_packet, this.strips.length);

        let packet = StripPacket(strips_in_packet, this.pixels_per_strip);
        let buf = ref.alloc(packet);

        let msg = new packet(buf);

        msg.sequence_no = this.packet_number++;

        for(let strip_idx = 0; strip_idx < strips_in_packet; strip_idx++) {
            const [strip, colorbuf] = this.strips.shift();
            // copy faster...
            for (let i = 0; i < this.pixels_per_strip; i++) {
                msg.strip_updates[strip_idx].strip_id = strip;
                msg.strip_updates[strip_idx].pixel_data[i] = colorbuf[i];
            }
        }

        this.socket.send(buf, this.port, this.ip, (err) => {
            if (err)
                console.log('error sending pixels');
        });
    }

    sendloop() {
        while (this.strips.length > 0) {
            const start = process.hrtime();
            this._sendPacket();
            const [sec, ns] = process.hrtime(start);
            const total_ms = (sec * 1e9 + ns) / 1000;
            setTimeout(() => this.sendloop(), this.update_period - total_ms);
        }
    }

    sync() {
        this.sendloop();
    }

    toString() {
        return (
            `PixelPusher ${this.group_id}-${this.controller_id}\n`+
            `MAC ${this.mac} IP ${this.ip}:${this.port}\n`+
            `rev ${this.hardware_rev} (hw) ${this.software_rev} (sw)\n`+
            `${this.pixels_per_strip} pixels/strip, ${this.strips_attached} strips`
        );
    }
}
