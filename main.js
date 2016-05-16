(function (window,undefined) {
    var util = {
        //检查变量是否定义
        isDef: function (val) {
            return val !== void 0;
        },
        //获取name的dom节点
        getId: function (name) {
            return document.getElementById.call(window.document, name);
        },
        //创建canvas上下文
        createCanvasContext2D: function (name) {
            var canvas = this.getId(name);
            var ctx = canvas.getContext('2d');
            return ctx;
        },
        //向已知dom后添加新元素
        appendChildDom: function (domChild, domParent) {
            domParent.appendChild(domChild);
        },
        //创建空的canvas
        createCanvas :function(width,height,id,parentDOM){
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.id = id;
            this.appendChildDom(canvas,parentDOM);
            return canvas;
        },
        //计算fps

        //计算速度

    };
    //红包构造器
    /**
     *
     * @param name
     * @param options
     */
    var weddingPresent = function (name,options,callback) {
        var options = util.isDef(options)?options:{};
        //canvas名称
        this.NAME = name;
        //设置画布宽高
        this.WIDTH = options.WIDTH;
        this.HEIGHT = options.HEIGHT;
        //红包大小
        this.weddingPresentWidth = util.isDef(options.wpWidth)?options.wpWidth:30;
        this.weddingPresentHeight = util.isDef(options.wpHeight)?options.wpHeight:40;
        //红包个数以及速度,获取红包个数
        this.weddingPresentCount = util.isDef(options.wpCount)?options.wpCount:10;
        this.weddingPresentvelocityY = util.isDef(options.wpY)?options.wpY:300;
        this.weddingPresentvelocityX = util.isDef(options.wpX)?options.wpX:300;
        this.weddingPresentSum = 0;
        //中奖信息
        this.rewardsInfo = options.rewardsInfo;
        //红包持续时间
        this.delayTime = util.isDef(options.delayTime)?options.delayTime:10;
        //当前时间用于计时
        this.timer = +new Date;
        //存储初始红包属性
        this.wPresent = [];
        //img
        this.img = null;
        this.imageClickArr = options.imageClickArr;

        this.imgSrcArr = options.imageOrigin;
        this.imgOrigin = this.createImg(this.imgSrcArr[0]);
        this.imgOrigin1 = this.createImg(this.imgSrcArr[1]); 

        //img1
        this.img1 = null;
        this.img1Src = options.imageClickArr[0];
        //2d 环境引用
        this.ctx = null;
        //
        this.window = window;
        //记录红包掉落数目
        this.sum=0;
        //lastTime用于计算fps
        this.lastTime = 0;
        //速度随机数组
        this.vArr = [0.8,0.6,1];
        //回调函数
        this.callback = callback;

    };
    weddingPresent.prototype = {
        constructor : weddingPresent,
        //初始化红包
        init: function () {
            //初始化canvas
            util.createCanvas(this.WIDTH,this.HEIGHT,this.NAME,document.body);
            //设置ctx
            this.ctx = this.setCtx();
            //创建面板
            new panel();
            //添加点击监听
            this.ctx.canvas.addEventListener('click', this.handler(this));
            //初始化红包
            this.createWedPresent();
            //初始化img
            this.imgOrigin = this.createImg(this.imgSrcArr[0]);
            this.imgOrigin1 = this.createImg(this.imgSrcArr[1]);
            // this.img = this.createImg(this.imgSrc);
            this.img1 = this.createImg(this.img1Src);
            var that = this;
            this.imgOrigin.onload = function () {
                that.window.requestAnimationFrame(that.animate());
            };
        },
        //组织红包对象
        concatWedInfo:function(data,status){
          /*
            如果status==0的话，此时为初始化状态，否则按照getNewInfo进行灌数据
          */
          var data = data;
          if(status===0){
            var arr = [];
            for (var i = 0; i < data.length; ++i) {
                var random = Math.random();
                arr[i] = {
                    id: i,
                    x: ((this.WIDTH) * random+this.WIDTH/3),
                    y: -1*(this.HEIGHT) * (Math.random()),
                    velocityX: this.weddingPresentvelocityX,
                    // velocityY: (random < 0.5 ? this.weddingPresentvelocityY * 0.8 : random * this.weddingPresentvelocityY),
                    velocityY:this.vArr[Math.floor(10*Math.random()%3)]*this.weddingPresentvelocityY,
                    img: false,
                    bottom: false,
                    grade:data[i].grade,
                    rewards:data[i].rewards,
                    imgSrc:Math.random()>0.2?this.imgOrigin:this.imgOrigin1
                }
            }
          }else{
              var random = Math.random();
              var arr = {
                  id: i+this.weddingPresentCount,
                  x: ((this.WIDTH) * random+this.WIDTH/3),
                  y: -1*(this.HEIGHT) * (Math.random()),
                  velocityX: this.weddingPresentvelocityX,
                  velocityY: this.vArr[Math.floor(10*Math.random()%3)]*this.weddingPresentvelocityY,
                  img: false,
                  bottom: false,
                  grade:data.grade,
                  rewards:data.rewards,
                  imgSrc:Math.random()>0.2?this.imgOrigin:this.imgOrigin1
              }
          }              
          
          return arr;
        },
        //生成初始红包
        createWedPresent: function () {
            //获取前五个数据
            var data = this.rewardsInfo.splice(0,this.weddingPresentCount);
            this.wPresent = this.concatWedInfo(data,0);
            return this.wPresent;
        },
        //建立栅格底图
        drawGrid: function (color, stepx, stepy) {
            var context = this.ctx;
            context.strokeStyle = color;
            context.lineWidth = 0.5;

            for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
                context.beginPath();
                context.moveTo(i, 0);
                context.lineTo(i, context.canvas.height);
                context.stroke();
            }

            for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
                context.beginPath();
                context.moveTo(0, i);
                context.lineTo(context.canvas.width, i);
                context.stroke();
            }
        },
        //绘制
        draw: function (ctx,hb,fps) {
            ctx.save();
            hb.forEach(function (e) {
                this.adjustPosition(e,fps);
            }.bind(this));
            ctx.restore();
        },
        //计算fps
        calculateFps : function(now){
            var fps = 1000/(now-this.lastTime);
            this.lastTime = now;
            return fps;
        },
        //遍历红包信息
        forEachCacheHbToId: function (x, y) {
            var that = this;
            that.wPresent.forEach(function (hb) {
                that.ctx.beginPath();
                that.ctx.rect(hb.x, hb.y, that.weddingPresentWidth, that.weddingPresentHeight);
                if (that.ctx.isPointInPath(x, y)) {
                    if (hb.img) {
                        if(hb.rewards==true){
                            console.log('中奖类别'+hb.grade)
                        }
                        var num = ++that.weddingPresentSum;
                        that.changeHbCount(num);

                        that.ctx.drawImage(that.img1, 0, 0, that.weddingPresentWidth, that.weddingPresentHeight, hb.x, hb.y, that.weddingPresentWidth, that.weddingPresentHeight);
                        that.wPresent.forEach(function(e){
                            if(e.id == hb.id){
                              e.img = false;
                              e.bottom = true;
                            }
                        });
                    }

                    return;
                }
            })
        },
        //adjustPosition
        adjustPosition: function (hb,fps) {

            if (hb.y > this.ctx.canvas.height||hb.x + hb.velocityX < 0) {

                var data = this.rewardsInfo.shift();
                var id = hb.id;
                for (var i = 0,j = this.wPresent; i < j.length; i++) {
                    if(j[i].id == id){
                      this.wPresent.splice(i,1);
                      break;
                    }
                };
                // this.wPresent.splice(id,1);
                var getNewInfo = this.concatWedInfo(data,1);
                getNewInfo.id = id + this.weddingPresentCount;
                this.wPresent.push(getNewInfo);

                var random = Math.random();
                var height = this.getExtent(this.ctx).height;
                var width = this.getExtent(this.ctx).width;
                hb.id = id;
                hb.y = -this.weddingPresentHeight;
                // hb.x = random * width + 3*width/4;
                hb.x = width/3+random*width;
                if (hb.bottom) {
                    hb.bottom = false;  
                }
                // console.log(++this.sum);
            }else{
              // hb.x -= hb.velocityX/fps;
              // hb.y += hb.velocityY/fps;
              hb.x -= hb.velocityX/70;
              hb.y += hb.velocityY/70;
            }
            
            hb.img = !(hb.bottom);
  
            if (hb.img) {
                this.ctx.drawImage((hb.imgSrc), hb.x, hb.y, this.weddingPresentWidth, this.weddingPresentHeight);
            } else {
                var img1 = this.createImg(this.imageClickArr[hb.grade]) ;
                this.ctx.drawImage(img1, hb.x, hb.y, this.weddingPresentWidth, this.weddingPresentHeight);
            }
        },
        //动画过程
        animate: function () {
            return function(){
                // var that = that;
                this.clear(this.ctx);
                // this.drawGrid('lightgray', 10, 10);
                var hb = this.wPresent.length > 0 ? this.wPresent : this.wPresent;
                var fps = this.calculateFps(new Date());
                this.draw(this.ctx, hb,fps);
                if (+new Date - this.timer <= this.delayTime * 1000) {
                    this.window.requestAnimationFrame(this.animate());
                    //changeTime
                    var timeR = ((this.delayTime * 1000 - (+new Date - this.timer)) / 1000).toFixed(0);
                    this.changeReleaseTime(timeR);
                } else {
                    this.window.cancelAnimationFrame(this.animate);
                    this.clear(this.ctx);
                    //移除canvas元素
                    var canvas = util.getId('canvas');
                    document.body.removeChild(canvas);
                    //回调函数
                    this.callback(this.weddingPresentSum);   
                    //移除click               
                    this.ctx.canvas.removeEventListener('click', this.handler(this));
                }
            }.bind(this);

        },
        //生成img
        createImg: function (src) {
            var img = new Image();
            img.src = src;
            return img;
        },
        //click处理事件
        handler: function (that) {
            var that = that;
            return function(e){
                e.preventDefault();
                var a1 = that.ctx.getImageData(e.clientX, e.clientY, 1, 1);
                if (a1.data.toString() !== [0, 0, 0, 0].toString()) {
                    that.forEachCacheHbToId(e.clientX, e.clientY);
                }
            }

        },
        //变更剩余时间
        changeReleaseTime: function (time) {
            var releaseTtime = util.getId('releaseTtime');
            releaseTtime.textContent = time;
        },
        //变更红包个数
        changeHbCount: function (num) {
            var hbCount = util.getId('hbCount');
            hbCount.textContent = num;
        },
        //清空画布
        clear: function () {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        },
        //设置ctx
        setCtx: function () {
            return this.ctx = util.createCanvasContext2D(this.NAME);
        },
        //获取画布宽高
        getExtent: function () {
            return {
                width: this.ctx.canvas.width,
                height: this.ctx.canvas.height
            }
        }

    };
    //面板
    var panel = function(){
        var str = '<div id="controls">';
            str += '<p>时间:<span id="releaseTtime">5</span></p>';
            str += '<p>红包个数:<span id="hbCount">0</span></p>';
            str += '</div>';
        var div = document.createElement('div');
        div.id = 'createContent';
        document.body.appendChild(div);
        div.innerHTML = str;
        var clickDiv = document.getElementById('createContent');
        clickDiv.onClick = function(e){
            e.preventDefault();
        }

    }
    window.weddingPresent = weddingPresent;

}(window,undefined))