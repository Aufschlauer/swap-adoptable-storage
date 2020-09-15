# swap-adoptable-storage
How to swap adoptable storage SD card on Android 7 (Nougat)

I'm using a Samsung Galaxy S7 with Android 7.1.2 for a long time. I started with a 8 GB SD card as adoptable storage. That was fine until the missing space on the SD card become more and more a pain. So I ordered a 128 GB SD card and tried to move all my stuff from 8 GB SD card to 128 GB SD card.

All the ways I could image didn't work, like

  * Just `dd` the discs
  * `luks` encryption

So here comes a guide how to swap the adoptable storage SD card on Android 7. This guide was made in the context of

  * Target
    * Samsung Galaxy S7
    * Android 7.1.2
  * Host
    * Linux Mint 19.3 Tricia

In my case the device `/dev/sde` is the SD card slot on the host.

 1. Make a backup of your current SD card  
 `$ sudo dd if=/dev/sde of=SamsungGalaxyS7_8GB_InternalStorage.img.bin bs=1M status=progress`
 2. `dd` the image to your new SD card  
 `$ sudo dd if=SamsungGalaxyS7_8GB_InternalStorage.img.bin of=/dev/sde bs=1M status=progress`
 3. For the next step you need a patched `gdisk`  
 4. Get the source of `gdisk` - more information can be found here (german): https://www.android-hilfe.de/forum/android-6-0-x-marshmallow.2417/adopted-sd-partition-vergroessern.823463.html  
   `$ apt-get source gdisk`
 5. Patch parttypes.cc according to  

          $ diff -Naur gdisk-1.0.3/parttypes.cc /usr/src/gdisk-1.0.3/parttypes.cc 
          --- gdisk-1.0.3/parttypes.cc	2017-07-28 03:41:20.000000000 +0200
          +++ /usr/src/gdisk-1.0.3/parttypes.cc	2020-09-06 19:49:11.614131088 +0200
          @@ -263,6 +263,8 @@
              // A straggler Linux partition type....
              AddType(0xfd00, "A19D880F-05FC-4D3B-A006-743F0F84911E", "Linux RAID");

          +   AddType(0xffff, "193D1EA4-B3CA-11E4-B075-10604B889DCF", "Android Expand");
          +
              // Note: DO NOT use the 0xffff code; that's reserved to indicate an
              // unknown GUID type code.
           } // PartType::AddAllTypes()

 6. sh
 

 