implementation of bit-torrent client using nodejs

1.Udp is preferred over tcp cz tcp has a lot of overhead (encryption,ip address...)(server side)

2.Generally udp is used for streaming.(server side)

3.bencoding is simple way of encoding in torrent clients(ex: 4:SNAP)

4.torrent file is from nyaa.si which downloads Jujutsu kaisen chapter 182 https://nyaa.si/view/1519525 (use vpn or tor)

5.tracker is exodus.desync.com

6.
TCP:

Send: AA BBBB CCC DDDDDD E         Recv: A ABB B BCC CDDD DDDE

(the chunks are further divided into pieces so the chunks are not preserved but all the bytes comes in same order)

UDP:

Send: AA BBBB CCC DDDDDD E         Recv: CCC AA E

(chunks are preserved but it neither gurantees all chunks will come nor the data order is preserved. )

7.file size 9027458.

8.generally servers use 16kb(16384B) for piece size.
