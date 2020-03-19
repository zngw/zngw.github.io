const imgRoot = '//guoke3915.coding.net/p/guoke3915/d/img/git/raw/master'
//const imgRoot = '/photos'
photo = {
    // 当前显示类型、dir-目录,photo-照片
    type: 'dir',

    // 相册索引
    photoIndex: 0,

    // 分类索引
    categoryIndex: 0,

    // 相册数据数组
    photoArray: null,
    //offset 每次加载照片数量，以分类为一个单位
    offset: 10,

    init: function () {
        var that = this;
        if (this.photoArray == null) {
            $.ajax({
                type:"GET",
                url:imgRoot + "/photo.jsonp",
                dataType:"jsonp",
                jsonp:"callback",
                jsonpCallback:"callback",
                success:function(data){
                    photoArray = data;
                    that.show();
                    
                }
            });
        } else {
            this.show();
        }

    },
    show: function(){
        let param = window.location.hash;
        if(param && param.length>1){
            let dir = decodeURIComponent(param.substring(1));

            for(let i = 0; i < photoArray.length; i++){
                if(photoArray[i].dir == dir){
                    this.photoIndex = i;
                    this.categoryIndex = 0;
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
        this.type = 'dir';
        $(".photo-div").empty();

        let li = '<div class="photo-box">';
        for (let i = 0; i < data.length; i++) {
            let cover = data[i].cover; // 封面
            let width = 275;    // 相册目录定长宽 3:2
            let height = 183; // width * cover.height / cover.width;
            let title = '创建于'+data[i].date+' 共'+data[i].num+'张'
            li += '<div class="photo-box-item" style="width: ' + width + 'px">' +
                        '<div class="photo-box-item-click" id="' + i + '" style="height:' + height + 'px">' +
                            '<img class="nofancybox"  src="' + imgRoot + cover.url + '" alt="' + title + '" title="' + title + '"/>' +
                        '</div>' +
                        '<div>' + data[i].dir + '</div>' +
                    '</div>'
        }
        li += '</div>';
        $(".photo-div").append(li);
        this.minigrid();
    },
    render: function (page) {
        if (!photoArray || photoArray.length <= this.photoIndex) {
            return;
        }

        // 相册数据
        var photoData = photoArray[this.photoIndex];
        if(!photoData || photoData.length <= page)
            return;

        this.type = 'photo';

        // 插入相册标题
        if (page == 1) {
            let li = '<div class="photo-title">' +
                '<div class="photo-title-text">' + photoData.dir + 
                '<a href="" class="photo-back">返回</a>'  +'</div>' +
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
            if (i < this.categoryIndex) {
                // 跳过
                continue;
            } else if (page <= i && showCount>=this.offset) {
                // 结束
                break;
            } else {
                // 加入分类信息
                this.categoryIndex++;
                let title = photoCategory.date + (photoCategory.name?'| ':'')+photoCategory.name ;
                let li = '<div class="photo-category-text" id="' + title + '">'+
                        '<a href="' + title+  '" class="headerlink" title="' + title +  '"></a>' +  title +'</div>' +
                    '<div class="photo-category photo-category-box-' + this.categoryIndex + '">'
                    
                    li += '</div>'
                    $(".photo-div").append(li);

                for (let j = 0; j < photoCategory.photo.length; j++) {
                    showCount++;

                    // 相片数据
                    let data = photoCategory.photo[j];
                    let imgNameWithPattern = data.url;
                    let imgName = data.name;
                    let li = '<a data-fancybox="gallery" href="' +imgRoot + imgNameWithPattern  + '?raw=true" data-caption="' + imgName + '">' +
                    '<img  src="' + imgRoot + photoData.mini + imgNameWithPattern + '" alt="' + imgName + '" title="' + imgName + '"></a>'
                       
                    $('.photo-category-box-' + this.categoryIndex).append(li);
                    $('.photo-category-box-' + this.categoryIndex).justifiedGallery({
                            rowHeight: 210,
                            margins: 3,
                            randomize: true
                        });

                    $(".photo-div").lazyload();
                    this.minigrid();
                }
            }
        }
    },
    minigrid: function () {

        // 使用 minigrid动态布局相册
        var grid = null;
        if (this.type == "dir") {
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
            if (that.type == "dir") {
                grid.mount();
            } 

            // 计算宽度是否加载新相片
            that.loading();
        });

        // 监听滚动事件
        $(window).on('scroll', function () {
            // 计算宽度是否加载新相片
            that.loading();
        });

        // 相册点击事件
        $(".photo-box-item-click").bind("click", function () {
            if (!photoArray || photoArray.length <= this.id) {
                return;
            }

            let url = window.location.href.split('#')[0];
            window.location.replace(url+'#'+photoArray[this.id].dir);

            $(".photo-div").empty();
            that.photoIndex = this.id;
            that.categoryIndex = 0;
            that.render(1)
        });

        // 返回相册事件
        $(".photo-back").bind("click", function () {
            if (!photoArray || photoArray.length <= this.id) {
                return;
            }

            let url = window.location.href.split('#')[0];
            window.location.replace(url+'#');
            $(".photo-div").empty();
            that.randerDir();
            return false;
        });
    },

    // 判断滚动长度大于时加载新的
    loading: function () {
        if (this.type != 'photo') {
            return;
        }

        var scrollTop = $(window).scrollTop();
        if(scrollTop+$(window).height()>$(".photo-div").height()){
            this.render(this.categoryIndex+1);
        }
    }
}
photo.init();