import { types } from 'ref';
import Struct from 'ref-struct';
import Array from 'ref-array';

const uint8_buffer = Array(types.uint8);

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
  uint8  strips_attached;
  uint8  max_strips_per_packet;
  pixels_per_strip: types.uint16,
  update_period: types.uint32,
  powerotal: types.uint32,
  delta_sequence: types.uint32,
  controller_ordinal: types.int32,
  group_ordinal: types.int32,
  artnet_universe: types.uint16,
  artnet_channel: types.uint16,
  my_port: types.uint16,
  padding1: types.uint16,
  strip_flags: uint8_buffer(8),
  padding2: types.uint16,
  pusher_flags: types.uint32,
  segments: types.uint32,
  power_domain: types.uint32,
  last_driven_ip: uint8_buffer(4),
  last_driven_port: types.uint16,
});
