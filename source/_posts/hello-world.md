---
title: immich 高性能相册管理工具-私有化部署【群晖】
---

## 背景

以下是我当前生活照片、视频的管理思路。其他图片和视频会单独管理，有机会再分享。

iCloud + immich + 百度云

* iCloud

> 日常多设备同步还是很方便，图片信息搜索强大

* immich

> 性能超好，而且还支持网页查看，看生活视频非常流畅而且无损。拍的视频分享和家人和朋友预览，简直太棒了！无损、速度超快、界面友好。（前提是你已经做好了内网穿透）

> 我会将视频上传后，将本地和iCloud的视频删除，空间释放。

> 原本用的群晖自带的moment，看图片还可以。但是对于视频支持非常糟糕，特别是iPhone 的HEVC格式，长一点mov视频，网页端可能根本看不了，app端还有加载进度条？！ 查看视频非常难受，超级难用！分享给家人朋友预览界面也特别差！

* 百度云

> 用于冷备份，最后的保护；免费空间有2T，阿里云免费空间小，而且被电影资源占据一些空间，所以选择百度云。

## 以部署到群晖NAS - docker为例

官方文档

[https://github.com/imagegenius/docker-immich](https://github.com/imagegenius/docker-immich)

民间大佬制作的轻量docker版

[imagegenius/docker-immich: Monolithic (Single) Docker Container for Immich (github.com)](https://github.com/imagegenius/docker-immich)

## 操作步骤

一、先在docker目录下创建文件夹

* immich
  * config
  * db
  * photos
  * machine

![image](https://res.craft.do/user/full/db4bcc1c-4b57-b6c6-3b04-c5f8d3964559/doc/C77EEC4A-54A3-470F-9972-CD7BA65FBB31/387807AF-F305-40BD-B6FB-4267B61081E7_2/3y8lKJHRVPWlXNtWsbHYdqTBTNJpGPQyC77CmWJR5rUz/Image.png)

二、开始部署

我是在portainer里部署的，这个docker管理很好用。

![image](https://res.craft.do/user/full/db4bcc1c-4b57-b6c6-3b04-c5f8d3964559/doc/C77EEC4A-54A3-470F-9972-CD7BA65FBB31/AB91A307-5165-48C1-9091-5FD0F1DD43A4_2/8T8bxtDlDo3pose3cA4Mj2tJbkE07Zlqtt3YnxJta1Az/Image.png)

> 点击 `步骤2`会构建出3个容器

![image](https://res.craft.do/user/full/db4bcc1c-4b57-b6c6-3b04-c5f8d3964559/doc/C77EEC4A-54A3-470F-9972-CD7BA65FBB31/9CCA1158-A355-4DB8-8C79-6559772E38DD_2/1xyPSXjBRLxVveMq5xJQSQpNLZ6uWlOvS8EiVCZLCcgz/Image.png)

### 官方的 Docker Compose

```yaml
---
version: "2.1"
services:
  immich:
    image: ghcr.io/imagegenius/immich:latest
    container_name: immich
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DB_HOSTNAME=192.168.1.x
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE_NAME=immich
      - REDIS_HOSTNAME=192.168.1.x
      - DISABLE_MACHINE_LEARNING=false #optional
      - DISABLE_TYPESENSE=false #optional
      - DB_PORT=5432 #optional
      - REDIS_PORT=6379 #optional
      - REDIS_PASSWORD= #optional
      - MACHINE_LEARNING_WORKERS=1 #optional
      - MACHINE_LEARNING_WORKER_TIMEOUT=120 #optional
    volumes:
      - path_to_appdata:/config
      - path_to_photos:/photos
      - path_to_machine-learning:/config/machine-learning #optional
      - path_to_imports:/import #optional
    ports:
      - 8080:8080
    restart: unless-stopped
# This container requires an external application to be run separately to be run separately.
# Redis:
  redis:
    image: redis
    ports:
      - 6379:6379
    container_name: redis
# PostgreSQL 14:
  postgres14:
    image: postgres:14
    ports:
      - 5432:5432
    container_name: postgres14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: immich
    volumes:
      - path_to_postgres:/var/lib/postgresql/data
```

### 我修改过的

```yaml
---
version: "2.1"
services:
  immich:
    image: ghcr.io/imagegenius/immich:latest
    container_name: immich
    environment:
      - PUID=1026
      - PGID=101
      - TZ=Asia/Shanghai
      - DB_HOSTNAME=192.168.3.3
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE_NAME=immich
      - REDIS_HOSTNAME=192.168.3.3
      - DISABLE_MACHINE_LEANRNING=false
      - DISABLE_TYPESENSE=false
      - DB_PORT=15432
      - REDIS_PORT=6379
      - REDIS_PASSWORD=
      - CUDA_ACCELERATION=false
    volumes:
      - /volume1/docker/immich/config:/config
      - /volume1/docker/immich/photos:/photos
      - /volume1/docker/immich/machine:/config/machine-learning
    ports:
      - 18080:8080
    restart: unless-stopped
  redis:
    image: redis
    ports:
      - 6379:6379
    container_name: redis
  postgres14:
    image: postgres:14
    ports:
      - 15432:5432
    container_name: postgres14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: immich
    volumes:
      - /volume1/docker/immich/db:/var/lib/postgresql/data
```

如果有出现问题： 建议看看这个简短的视频！

[https://www.bilibili.com/video/BV1ro4y1K76U/](https://www.bilibili.com/video/BV1ro4y1K76U/)

## 目录介绍

- photos

  - upload
    - 正在处理的文件
  - thumbs
    - 照片：生成1份小缩略图（webp） + 1份大缩略图（jpeg）
  - encoded-video
    - 视频： 生成1份悬浮视频，用于快速预览
  - library
    - admin 这里面存的原文件（图片+视频）
- machine
  机器学习目录，用户人脸识别，地址位置分析
- config
  配置信息目录
- db
  数据库目录

## 备份恢复

> 我发现备份这4个目录是可以恢复的, 但是如果里面的信息被破坏了就麻烦了，我就经历过 :(

- 旧设备：

  - 备份 immich下的4个子目录
- 新设备：

  - 先创建immich主目录， 再分别创建4个子目录
  - 重新拉取镜像，创建容器，启动，页面打开成功！
    - 删除4个子目录，并把之前备份的4个目录拖进来

你可能想问为什么要多次一举？ 主要是怕目录权限出现问题，官方建议不要手动创建db目录，以免读取不到immich数据库。我也不记得哪里出现了问题，即使权限拉满了，依旧识别不到immich数据库。恢复备份后来单独做过测验，证明是可行的。跟官方沟通过，记得在替换的时候把相关容器先关闭哦！

## 注意事项

之前上传过的图片，即便拖拽到文件目录也会再上传一遍，因为是根据数据库信息做的校验，所以相同的会存有两份。所以只能通过官方的上传入口

immich 缺点：

- 稳定性
  - 开源团队维护和疑问解答都非常积极，项目发展前景很好。但是只建议将immich只作为辅助工具，服务蹦了也不怕。
- 同步
  - 因为是依赖数据库存储和加载内容，所以你直接将文件拖进 `library/admin/` 里面，它是不会处理的。你必须通过上传，系统会自动产生这张图片的相关信息。
- 最坏的情况出现
  - 当镜像无法启动，启动后无法进入管理页面，出现502等情况；不要着急， 建议直接去官方issues里搜索，或创建issue提问。

下期预告：

> 在使过用一段时间后我发现了一些细节问题，下一篇我将讲述为什么需要和MT-Photo双持使用。