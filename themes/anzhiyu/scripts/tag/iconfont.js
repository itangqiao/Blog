<<<<<<< HEAD
'use strict';
function iconFont(args) {
  args = args.join(' ').split(',');
  let p0 = args[0];
  let p1 = args[1] ? args[1] : 1;
  return `<svg class="icon" style="width:${p1}em; height:${p1}em" aria-hidden="true"><use xlink:href="#${p0}"></use></svg>`;
}

hexo.extend.tag.register('icon', iconFont);
=======
'use strict';
function iconFont(args) {
  args = args.join(' ').split(',');
  let p0 = args[0];
  let p1 = args[1] ? args[1] : 1;
  return `<svg class="icon" style="width:${p1}em; height:${p1}em" aria-hidden="true"><use xlink:href="#${p0}"></use></svg>`;
}

hexo.extend.tag.register('icon', iconFont);
>>>>>>> 2c89ef2ea7ba6d91cbee9bc9d09cdec5937f8b9e
