---
title: 如何创建自己的Hexo博客
date: 2016-06-07 14:37:03
tags: 
	- hexo
---

>Hexo是一个开源的博客工具，我们可以通过他简单地创建属于我们的个人博客站点


- 安装 [nodejs](https://nodejs.org)

- 通过npm安装hexo客户端

    ```
	npm install hexo-cli -g
    ```
- 创建本地服务器（默认端口4000）

    ```
	hexo init blog
	cd blog
	npm install
	hexo server
	```

- 更换[模板](http://www.zhihu.com/question/24422335)

    - 下载模板
    ```
    cd themes
	git clone <模板项目的地址>
	```

    - 指定模板 config.yml
	```
	theme: 模板名（themes目录下的模板文件夹名，注意冒号后面有个空格）
	```
- 创建一篇新文章

	- scaffolds目录下保存文章模板

	- source目录下保存文章

	```
	hexo new post helloworld # 模板为post，文件名为helloworld的文章
	```
	- 或者直接在 source 的_post目录下添加修改，本地服务器上可以看到即时改动


- 发布到github
	- 在github上创建Page项目：项目名为 `用户名.github.io`

	- hexo的发布模块
	
	```
	npm install hexo-deployer-git --save
	```
	- hexo的发布配置 _config.yml

    ```
	deploy:
	type: git
	repo: git@github.com:用户名/用户名.github.io.git
	branch: master
    ```
	- 生成静态代码，发布
	
	```
	hexo generate
	hexo deploy
	```

## Tips
- 当前hexo目录，可以放在Page项目里除gh-pages和master以外的分支中

- 除了发布目录下的文章，模板配置的改动，本地服务器上都可以即时看到（但是更换模板需要重启服务）

- 写完博客后，用简化的命令 `hexo generate --deploy`直接先生成再发布（`hexo deploy --generate`功能相同）

- 不光是yml文件，包括markdown文档，字段名的冒号后一定要跟上一个半角空格，不然会报错