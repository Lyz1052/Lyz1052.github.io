
/**
 * Front-matter Helper Created by zly on 2016/6/8.
 *
 * 自动生成Front-matter，有Front-matter的不处理
 * 需要自动处理的，必须有两行 日期标签行（顺序无所谓），后面跟一个空行：
 *
 * 2017年4月14日16:21:48
 * 标签A，标签B
 *
 * 正文。。。。
 *
 * 生成规则：
 * title:文件名
 * date:（不为空的）内容日期转换
 * tags:（不为空的）内容根据空格，中英文逗号，分号，点分割
 * categories:根据路径生成，名称与文件夹名称相同
 *
 */
var fs = require('hexo-fs');
var _ = require('lodash');
var util = require('util');
var moment = require('moment');

hexo.source.addProcessor('posts/*path', function(file){
	
	var path = file.source;
	var categories = file.path.match(/\/[^\/]+(?=\/)/g);
	var title = file.path.match(/\/[^\/]+(?!\.)$/);

	categories = categories?['',...categories.map((s)=>{return s.replace(/\//,'')})].join('\n\t- '):'';
	title = title?title[0].replace(/\//,''):'';
	title = title&&title.indexOf('\.')!=-1?title.substring(0,title.indexOf('\.')):'';
	

	fs.exists(path,function(e){
		if(e){
			fs.readFile(path,function(err,data){
				var lines = data.split(/\s*[\s*\n\s*]+\n\s*/);
				var head='';//头部
				
				if(lines.length>1){//可能需要处理
					head = lines.shift(1);
					data = data.substr(data.indexOf(lines[0]),data.length);
					
					head = head.split(/\s*\n+\s*/);
					
					//console.log(util.inspect(head));
					
					if(head[0]!='---'&&head[0]!=';;;')
						getInfo(head[0],head[1]);
					
				}
				
				function getInfo(date,tags,stop){
					
					try{
						
						date = date?moment(date.replace(/[年月]/g,'-').replace(/[日]/g,' ')).date(4).format():moment().format();
						tags = tags?['',...tags.split(/[\s+,，.。;；]/g)].join('\n\t- '):'';
						
					}catch(e){
						
						stop = true;
						if(!stop)
							getInfo(tags,date,stop);
						
					}
					
					if(!stop)
						insertFrontMatter(date,tags);
				}
				
				function insertFrontMatter(date,tags){
					var pattern = "---\n";
					var info = {
						title:title,
						date:date,
						tags:tags,
						categories:categories,
						};
						console.log(util.inspect(title));
					var writeData = pattern;
					for(var i in info){
						if(info[i]){
							writeData += i+": "+info[i]+"\n";
						}
					}
					
					writeData+=pattern;
					writeData+=data;
					
					fs.writeFile(path, writeData, 'utf-8',(err) => {
					  if (err) {
						  console.log('ERROR on frontmatterhelper while handling '+path);
						  throw err;
					  }
					});
					
					
				}
			})
		}
	})
});
