import { types } from 'ref';
import Struct from 'ref-struct';
import Array from 'ref-array';

const uint8_buffer = (size) => Array(types.uint8, size);

/*
struct pusher_broadcast {
  uint8 mac[6];
  uint8 ip[4];
  uint8 deviceype;
  uint8 protocol;
  uint16 vid;
  uint16 pid;
  uint16 hardware_rev;
  uint16 software_rev;
  uint32 link_speed;
  uint8  strips_attached;
  uint8  max_strips_per_packet;
  uint16 pixels_per_strip;
  uint32 update_period;
  uint32 powerotal;
  uint32 delta_sequence;
  int32 controller_ordinal;
  int32 group_ordinal;
  uint16 artnet_universe;
  uint16 artnet_channel;
  uint16 my_port;
  uint16 padding1;
  uint8 strip_flags[8];
  uint16 padding2;
  uint32 pusher_flags;
  uint32 segments;
  uint32 power_domain;
  uint8 last_driven_ip[4];
  uint16 last_driven_port;
}
*/
export const DeviceType = {
    ETHERDREAM: 0,
    LUMIABRIDGE: 1,
    PIXELPUSHER: 2,
};


export const PusherBroadcast = Struct({
  mac: uint8_buffer(6),
  ip: uint8_buffer(4),
  devicetype: types.uint8,
  protocol: types.uint8,
  vid: types.uint16,
  pid: types.uint16,
  hardware_rev: types.uint16,
  software_rev: types.uint16,
  link_speed: types.uint32,
  strips_attached: types.uint8,
  max_strips_per_packet: types.uint8,
  pixels_per_strip: types.uint16,
  update_period: types.uint32,
  powertotal: types.uint32,
  delta_sequence: types.uint32,
  controller_ordinal: types.int32,
  group_ordinal: types.int32,
  artnet_universe: types.uint16,
  artnet_channel: types.uint16,
  my_port: types.uint16,
  //padding1: types.uint16,
  //strip_flags: uint8_buffer(8),
  //padding2: types.uint16,
  //pusher_flags: types.uint32,
  //segments: types.uint32,
  //power_domain: types.uint32,
  //last_driven_ip: uint8_buffer(4),
  //last_driven_port: types.uint16,
}, { packed: true});

console.log(PusherBroadcast.size);

export default PusherBroadcast;

export function macString(broadcast) {
    return broadcast.mac.toArray().map((octet) => octet.toString(16)).join(':');
}

export function StripUpdate(num_pixels) {
    return Struct({
        strip_id: types.uint8,
        pixel_data: uint8_buffer(3*num_pixels)
    }, {packed: true});
}

export function StripPacket(num_strips, num_pixels) {
    const StripUpdateArray = Array(StripUpdate(num_pixels), num_strips);

    const packet = new Struct({
        sequence_no: types.uint32,
        strip_updates: StripUpdateArray
    }, { packed: true });

    return packet;
}
