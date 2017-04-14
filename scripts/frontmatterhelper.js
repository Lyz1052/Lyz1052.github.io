
/**
 * Front-matter Helper Created by zly on 2016/6/8.
 *
 * 自动生成Front-matter，有Front-matter的不处理
 * 需要自动生成Front-matter的文件，头两行加上日期和标签（或只加日期）
 *
 * 生成规则：
 * title:文件名
 * date:（不为空的）第一行内容日期转换
 * tags:（不为空的）第二行内容根据空格，中英文逗号，分号，点分割
 * categories:根据路径生成，名称与文件夹名称相同
 *
 */
var fs = require('hexo-fs');
var util = require('util');

hexo.source.addProcessor('posts/*path', function(file){
	
	fs.exists(file.source,function(e){
		console.log(util.inspect(file.source));
	  console.log(util.inspect(e));
	})
  
});
