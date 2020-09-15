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
 `$ sudo if=/dev/sde of=SamsungGalaxyS7_8GB_InternalStorage.img.bin bs=1M status=progress`
 2. `dd` the image to your new SD card  
 `$ sudo dd if=SamsungGalaxyS7_8GB_InternalStorage.img.bin of=/dev/sde bs=1M status=progress`
 

 