var Hexo = require('hexo');
var hexo = new Hexo(process.cwd(), {});

hexo.extend.generator.register('categories', function(locals){
  
  return {
    path: 'categories.html',
    data: locals,
    layout: ['category', 'index']
  }
});