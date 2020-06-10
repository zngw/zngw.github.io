// 当前显示类型、dir-目录,photo-照片
var type = 'dir';

// 相册索引
var photoIndex = 0;

// 分类索引
var categoryIndex = 0;

// 相册数据数组
var photoArray = null;
//offset 每次加载照片数量，以分类为一个单位
var offset = 20;

var lastScrollTop=0;

photo = {
    init: function () {
        var that = this;
        if (photoArray == null) {
            $.ajax({
                type:"GET",
                url:"/photos/photo.json",
                dataType:"json",
                success:function(data){
                    photoArray = data;
                    that.show();
                    
                }
            });
        } else {
            this.show();
        }

        // 监听滚动事件
        $(window).on('scroll', function () {
            // 计算宽度是否加载新相片
            that.loading();
        });
    },
    show: function(){
        let param = window.location.hash;
        if(param && param.length>1){
            let dir = decodeURIComponent(param.substring(1));

            for(let i = 0; i < photoArray.length; i++){
                if(photoArray[i].dir == dir){
                    photoIndex = i;
                    categoryIndex = 0;
                    this.render(1)
                    return;
                }
            }
        }
        this.randerDir();
    },
    randerDir: function () {
        // 显示相册目录
        let data = photoArray;
        type = 'dir';

        // 显示目录
        let tocData = new Array()
        for (let i = 0; i < data.length; i++) {
            tocData.push({
                text: data[i].dir,
                id: i,
                level: 1,
            })
        }
        $(".post-toc-content").empty();
        $(".post-toc-content").append(this.toc(tocData));

        // 显示相册
        $(".photo-div").empty();
        let li = '<div class="photo-box">';
        for (let i = 0; i < data.length; i++) {
            let url = data[i].url;
            let cover = data[i].cover; // 封面
            let width = 275;    // 相册目录定长宽 3:2
            let height = 183; // width * cover.height / cover.width;
            let title = '创建于'+data[i].date+' 共'+data[i].num+'张'
            li += '<div class="photo-box-item" style="width: ' + width + 'px">' +
                        '<div class="photo-box-item-click" onclick="photo.navClick('+i+')" style="height:' + height + 'px">' +
                            '<img class="nofancybox"  src="' + url + cover.url + '" alt="' + title + '" title="' + title + '"/>' +
                        '</div>' +
                        '<div>' + data[i].dir + '</div>' +
                    '</div>'
        }
        li += '</div>';
        $(".photo-div").append(li);
        this.minigrid();
    },
    render: function (page) {
        if (!photoArray || photoArray.length <= photoIndex) {
            return;
        }

        // 相册数据
        var photoData = photoArray[photoIndex];
        if(!photoData || photoData.length <= page)
            return;

        type = 'photo';

        let url = photoData.url;

        // 显示目录
        let tocData = new Array()
        for (let i = 0; i < photoData.photos.length; i++) {
            let title = photoData.photos[i].name?photoData.photos[i].name:photoData.photos[i].date
            tocData.push({
                text: title,
                id: i,
                level: 2,
            })
        }
        $(".post-toc-content").empty();
        $(".post-toc-content").append(this.toc(tocData));

        // 插入相册标题
        if (page == 1) {
            let li = '<div class="photo-title">' +
                '<div class="photo-title-text">' + photoData.dir + 
                '<a href="javascript:void(0);" class="photo-back" onclick="photo.backClick()">返回</a>'  +'</div>' +
                //'<div class="photo-title-desc"> 创建于' + photoData.date + '/ 共' + photoData.num +' 张</div>' +
                '<div class="photo-title-desc">'+
                '<span class="post-time">'+
                '<span class="post-meta-item-icon"><i class="fa fa-calendar-o"></i></span>'+
                '<span class="post-meta-item-text">创建于</span>'+
                '<span class="post-meta-divider">'+ photoData.date  +'</span>'+
                '<span class="post-meta-item-text">|  </span>' +
                '<span class="post-meta-item-text post-meta-item-icon"><i class="fa fa-calendar-check-o"></i></span>'+
                '<span class="post-meta-item-text">更新于 </span>'+
                '<span class="post-meta-item-text">'+ photoData.update  +'</span>'+
                '<span class="post-meta-divider">|</span>' +
                '<span class="post-meta-item-icon"><i class="fa fa-camera-retro"></i></span>'+
                '<span class="post-meta-item-text">共</span>'+
                '<span class="post-meta-divider">'+ photoData.num  +'</span>'+
                '<span class="post-meta-divider">张</span>' +
                '<span id="/photos/index.html#'+photoData.dir+'" class="zngw_visitors" data-flag-title="'+photoData.dir+'">' +
                '<span class="post-meta-divider">|</span>'+
                '<span class="post-meta-item-icon"><i class="fa fa-eye"></i></span>'+
                '<span class="post-meta-item-text">浏览:</span>'+
                '<span class="zngw-visitors-count"></span>'+
               '</span>';

            $(".photo-div").append(li);
            addCount();
        }
        
        let showCount = 0;
        for (let i = 0; i < photoData.photos.length; i++) {
            // 分类
            photoCategory = photoData.photos[i];
            if (i < categoryIndex) {
                // 跳过
                continue;
            } else if (offset>0&&page <= i && showCount>=offset) {
                // 结束
                break;
            } else {
                // 加入分类信息
                categoryIndex++;
                let title = photoCategory.name?photoCategory.name:photoCategory.date;
                let text = photoCategory.date + (photoCategory.name?'| ':'')+photoCategory.name;
                let li = '<div class="photo-category-text" id="' + title + '">'+
                            '<a href="' + title+  '" class="headerlink" title="' + title +  '"></a>' +  text +'</div>' +
                         '<div class="photo-category photo-category-box-' + i + '">'
                    li += '</div>'
                    $(".photo-div").append(li);

                for (let j = 0; j < photoCategory.photo.length; j++) {
                    showCount++;

                    // 相片数据
                    let data = photoCategory.photo[j];
                    let li = '<a data-fancybox="gallery" href="' + url + photoData.hd + data.url + '?raw=true" data-caption="' + data.name + '">' +
                    '<img class="photo-img" src="' + url + photoData.mini + data.url + '" alt="' + data.name + '" title="' + data.name + '"></a>'
                       
                    $('.photo-category-box-' + i).append(li);
                    $('.photo-category-box-' + i).justifiedGallery({
                            rowHeight: 200,
                            margins: 3,
                            randomize: true
                        });

                    $(".photo-div").lazyload();
                    this.minigrid();
                }
            }
        }
    },
    toc: function(data) {      
        if (!data.length) return '';
      
        const className = 'nav';
        const listNumber = false;
      
        let result = `<ol class="${className}">`;
        const lastNumber = [0, 0, 0, 0, 0, 0];
        let firstLevel = 0;
        let lastLevel = 0;
      
        for (let i = 0, len = data.length; i < len; i++) {
          const el = data[i];
          const { level, id, text } = el;
      
          lastNumber[level - 1]++;
      
          for (let i = level; i <= 5; i++) {
            lastNumber[i] = 0;
          }
      
          if (firstLevel) {
            for (let i = level; i < lastLevel; i++) {
              result += '</li></ol>';
            }
      
            if (level > lastLevel) {
              result += `<ol class="${className}-child">`;
            } else {
              result += '</li>';
            }
          } else {
            firstLevel = level;
          }
      
          result += `<li class="${className}-item ${className}-level-${level}">`;
          result += `<a class="${className}-link" id="${id}" href="javascript:void(0);" onclick="photo.navClick(${id})">`;
      
          if (listNumber) {
            result += `<span class="${className}-number">`;
      
            for (let i = firstLevel - 1; i < level; i++) {
              result += `${lastNumber[i]}.`;
            }
      
            result += '</span> ';
          }
      
          result += `<span class="${className}-text">${text}</span></a>`;
      
          lastLevel = level;
        }
      
        for (let i = firstLevel - 1; i < lastLevel; i++) {
          result += '</li></ol>';
        }
      
        return result;
      },
    minigrid: function () {

        // 使用 minigrid动态布局相册
        var grid = null;
        if (type == "dir") {
            grid = new Minigrid({
                container: '.photo-box',
                item: '.photo-box-item',
                gutter: 12
            });
            grid.mount();
        }

        var that = this;

        // 监听窗口大小事件
        $(window).resize(function () {
            if (type == "dir") {
                grid.mount();
            } 

            // 计算宽度是否加载新相片
            that.loading();
        });
    },
    itemClick:function(id){
        if (!photoArray || photoArray.length <= id) {
            return;
        }

        window.location.replace('#'+photoArray[id].dir);
        $(".photo-div").empty();
        photoIndex = id;
        categoryIndex = 0;
        that.render(1)
    },
    backClick:function(){
        if (!photoArray) {
            return;
        }

        window.location.replace('#');
        $(".photo-div").empty();
        this.randerDir();
        return false;
    },
    navClick:function(id){
        if (type == "dir") {
            window.location.replace('#'+photoArray[id].dir);
            $(".photo-div").empty();
            photoIndex = id;
            categoryIndex = 0;
            this.render(1)
        }else{
            let pos = $('.photo-title-desc').offset().top+$('.photo-title-desc').height();
            let data = photoArray[photoIndex].photos;
            for(let i = 0; i < data.length; i++){
                if( i == id){
                    break;
                }

                let p = $('.photo-category-box-'+i);
                while(p == undefined){
                    this.render(categoryIndex+1);
                    p = $('.photo-category-box-'+i);
                }

                pos+= $('.photo-category-text').height();
                pos+= $('.photo-category-box-'+i).height();
            }

            $('.photo-category-box-'+id).resize(function () {
                if (type == "dir") {
                    return
                } 
    
                photo.navClick(id)
            });

            $('html,body').animate({scrollTop: pos},1000);
            return false;
        }
    },

    // 判断滚动长度大于时加载新的
    loading: function () {
        if (type != 'photo') {
            return;
        }

        var scrollTop = $(window).scrollTop();
        if(scrollTop+$(window).height()>$(".photo-div").height()){
            this.render(categoryIndex+1);
        }

        if(Math.abs(lastScrollTop-scrollTop)>200){
            lastScrollTop=scrollTop;
            $(".photo-img").each(function () {
                if ($(this).offset().top+$(this).height() < scrollTop - 210 || 
                    $(this).offset().top-210 > scrollTop + $(window).height()){
                    $(this).hide();
                }else{
                    $(this).show();
                }
            })
        }
    }
}
photo.init();