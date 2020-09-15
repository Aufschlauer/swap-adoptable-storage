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
 5. Patch `parttypes.cc` according to - the partition GUID must match the GUID of `android_expand` partition of the old disk  

          $ diff -Naur gdisk-1.0.3/parttypes.cc /usr/src/gdisk-1.0.3/parttypes.cc 
          --- gdisk-1.0.3/parttypes.cc	2017-07-28 03:41:20.000000000 +0200
          +++ /usr/src/gdisk-1.0.3/parttypes.cc	2020-09-06 19:49:11.614131088 +0200
          @@ -263,6 +263,8 @@
              // A straggler Linux partition type....
              AddType(0xfd00, "A19D880F-05FC-4D3B-A006-743F0F84911E", "Linux RAID");

          +   AddType(0xffff, "193D1EA4-B3CA-11E4-B075-10604B889DCF", "-->Unkown<--");
          +
              // Note: DO NOT use the 0xffff code; that's reserved to indicate an
              // unknown GUID type code.
           } // PartType::AddAllTypes()

 6. Use the patched `gdisk` to expand the partition  
 `$ sudo gdisk /dev/sde`
 7. After start of `gdisk`  
 ![alt text](<gdisk_start.png>)
 8. Delete `android_expand` partition  
 ![alt text](<delete_partition.png>)
 9. Create a new partition - ensure that the new size matches the size of the new SD card (128 GB in my case)  
 ![alt text](<create_new_partition.png>)
 10. Switch to expert menu and set the newly created partition GUID to the same of the old disk:  
 ![alt text](<partition_GUID.png>)
 11. Return to main menu and change partition name  
 ![alt text](<partition_name.png>)
 12. Verify that your partition matches the size of the new disk  
 ![alt text](<verify_partition.png>)
 13. Write new partition table to disk  
 ![alt text](<write_partition_table.png>)
 14. Decrypt newly created partition  
 `$ sudo dmsetup create crypt1 --table "0 $(sudo blockdev --getsize /dev/sde2) crypt aes-cbc-essiv:sha256 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 0 /dev/sde2 0"`  
 The `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` is the key to decrypt the partition. How to get the key is explained here: https://nelenkov.blogspot.com/2015/06/decrypting-android-m-adopted-storage.html
 15. Check the decrypted partition for errors:  
 
          $ sudo e2fsck -f /dev/mapper/crypt1
          e2fsck 1.44.1 (24-Mar-2018)
          Pass 1: Checking inodes, blocks, and sizes
          Pass 2: Checking directory structure
          Pass 3: Checking directory connectivity
          Pass 4: Checking reference counts
          Pass 5: Checking group summary information
          /dev/mapper/crypt1: 3046/484800 files (14.1% non-contiguous), 1693456/1936123 blocks

 16. Resize the partition

          $ sudo resize2fs /dev/mapper/crypt1
          resize2fs 1.44.1 (24-Mar-2018)
          Resizing the filesystem on /dev/mapper/crypt1 to 31212795 (4k) blocks.
          The filesystem on /dev/mapper/crypt1 is now 31212795 (4k) blocks long.

 17. I checked the resized partition for errors twice:

          $ sudo e2fsck -f /dev/mapper/crypt1
          e2fsck 1.44.1 (24-Mar-2018)
          Pass 1: Checking inodes, blocks, and sizes
          Inode 7, i_size is 2009149440, should be 2013372416.  Fix<y>? yes
          Pass 2: Checking directory structure
          Pass 3: Checking directory connectivity
          Pass 4: Checking reference counts
          Pass 5: Checking group summary information
          
          /dev/mapper/crypt1: ***** FILE SYSTEM WAS MODIFIED *****
          /dev/mapper/crypt1: 3046/7700240 files (14.1% non-contiguous), 2149093/31212795 blocks
          $ sudo e2fsck -f /dev/mapper/crypt1
          e2fsck 1.44.1 (24-Mar-2018)
          Pass 1: Checking inodes, blocks, and sizes
          Pass 2: Checking directory structure
          Pass 3: Checking directory connectivity
          Pass 4: Checking reference counts
          Pass 5: Checking group summary information
          /dev/mapper/crypt1: 3046/7700240 files (14.1% non-contiguous), 2149093/31212795 blocks

 18. Unmap the decrypted partition  
 `$ sudo dmsetup remove /dev/mapper/crypt1`

Finally you have a lot of free space:  
 ![alt text](<free_space.png>)