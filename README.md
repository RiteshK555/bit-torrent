1.Udp is preferred over tcp cz tcp has a lot of overhead (encryption,ip address...)(server side)

2.Generally udp is used for streaming.(server side)

3.bencoding is simple way of encoding in torrent clients(ex: 4:SNAP)

4.torrent file is from nyaa.si which downloads Jujutsu kaisen chapter 182 https://nyaa.si/view/1519525 (use vpn or tor)

5.TCP:

Send: AA BBBB CCC DDDDDD E         Recv: A ABB B BCC CDDD DDDE

(the chunks are further divided into pieces so the chunks are not preserved but all the bytes comes in same order)

UDP:

Send: AA BBBB CCC DDDDDD E         Recv: CCC AA E

(chunks are preserved but it neither gurantees all chunks will come nor the data order is preserved. )

6.file size 9027458.

7.generally servers use 16kb(16384B) for piece size.

8.Initial client connection state is "choked" and "not intrested".

9.The info in the torrent file contains hashes of all pieces concatinated (20bytes each).

10.Queue

We don't know the bandwidth of the peers so for downloading pieces as fast as possible we first send piece req to each of the peers and then we send another req if and only if the peer sends response. In this way we can easily download as fast as possible with little implementation.

11.downloaded file : Jujutsu Kaisen 182 (2022) (Digital).cbz
