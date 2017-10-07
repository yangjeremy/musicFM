
var music = new Audio()
var isLoop=false
var $loopBtn=$('.loop-btn')
var $channel=$("#channel")
var $volBar=$(".vol-bar")
var $volBtn=$(".vol-btn")
var $heart=$(".heart")
var $playBtn=$(".play-btn")
var $progressBarNode=$(".progress-bar")
var $progressNowNode=$(".progress")
var $timeNode=$(".time")
var $lrcCt=$(".lrcs")


var $channels=$(".channels"),
    $leftBtn=$(".left"),
    $rightBtn=$(".right"),
    $nextBtn=$(".next"),
    $firstChannel=$(".channels").find("li").first(),
    $secondChannel=$(".channels").find("li").eq(1),
    $lastChannel=$(".channels").find("li").last(),
    curPageIndex=0,
    isAnimate=false,
    channelLength=$(".channels").children().length,
    channelWidth=$firstChannel.width()
music.autoPlay=true
music.loop=isLoop


//歌曲介绍的节点
var $author=$('.singer')
var $cover=$('.cover')
var $title=$('.title')


var channelId="";


$(function(){
  getChannels()
  getMusicRandom()
  music.play()
})


/*  getMusicRandom()
  music.play()
  */


function getChannels(){
  $.ajax({
    url:"https://jirenguapi.applinzi.com/fm/getChannels.php",
    type: "get",
    dataType: "json"
  }).done(function(ret){
    //console.log(ret.channels[0].name)

    renderChannels(ret.channels)
    var $channels=$(".channels"),
        $leftBtn=$(".left"),
        $rightBtn=$(".right"),
        $nextBtn=$(".next"),
        $firstChannel=$(".channels").find("li").first(),
        $secondChannel=$(".channels").find("li").eq(1),
        $lastChannel=$(".channels").find("li").last(),
        curPageIndex=0,
        isAnimate=false,
        channelLength=$(".channels").children().length,
        channelWidth=$firstChannel.width()


        $(".channels").prepend($lastChannel.clone())
        $(".channels").append($firstChannel.clone())
        $(".channels").append($secondChannel.clone())


        $channels.width($firstChannel.width()*$channels.children().length)

      /*  $channels.css({'left':-channelWidth})*/


      $leftBtn.on('click',function(e){
       e.preventDefault()

       playPre()

      })

      $rightBtn.on('click',function(e){
       e.preventDefault()

       playNext()

      })


      function playPre(){
        if(isAnimate)return;
        isAnimate=true;

        $channels.animate(
          {left: '+='+$firstChannel.width()
        },function(){
          curPageIndex=curPageIndex-1;
          if(curPageIndex<0){  /*到了第一张再继续点击的时候*/
            $channels.css('left',-(channelLength*channelWidth));
            /*马上移动到最后一张*/
            curPageIndex=channelLength-1; /*序号到达最后一张*/
          }
          isAnimate=false;

        }
        )

      }
      function playNext(){
        if(isAnimate)return
        isAnimate=true
        $channels.animate({
          left: '-='+channelWidth     /*向右滚动*/
        },function(){
          curPageIndex=curPageIndex+1;  /*滚动一下下标就+1*/
          if(curPageIndex===channelLength){
            $channels.css({'left': -channelWidth})  /*到了最后一张再点击的
            时候马上恢复成第一张的状态*/
            curPageIndex=0
          }
          isAnimate=false;  /*false。关闭通道，退出。*/
        }
        )

      }

  }).fail(function(){
    console.log("获取专辑失败！")
  })



}

function renderChannels(channels){
  var html=channels.map(function(channel){
    return '<li data-channel-id="'+channel.channel_id+'">'+channel.name+'</li>'
  }).join("")
  //console.log(html)

  $channels.html(html)
}

function getMusicRandom(channelId){
  var channelId=channelId || 'public_yuzhong_huayu'
  var musicUrl="https://jirenguapi.applinzi.com/fm/getSong.php?channel="+channelId
  console.log("haha")
  console.log(musicUrl)
  $.ajax({
    type:"get",
    url:"https://jirenguapi.applinzi.com/fm/getSong.php?channel="+channelId,
    dataType:"json"
  }).done(function(ret){

   renderSong(ret.song[0])
   play(ret.song[0].url)
   getLrc(ret.song[0].sid)



  }).fail(function(){
    alert('播放音乐失败')
  })
}

function play(url){
  music.src=url
  music.play()
}



//频道的导航   事件监听

$channels.on("click","li",function(e){
  e.stopPropagation()
  if(e.target.tagName.toLowerCase()!=="li") return
  /*
  $(this).sibling().removeClass('active')
  $(this).addClass("active")
  */
  var channelId=$(this).attr("data-channel-id")
  $.ajax({
    url:"https://jirenguapi.applinzi.com/fm/getSong.php",
    method:"get",
    dataType:"json",
    data:{channel:channelId}
  }).done(function(data){
    console.log(data)

    renderSong(data.song[0])  //填空

    getLrc(data.song[0].sid)  //获取歌词

    play(data.song[0].url)    //播放音乐
  })
})

//细节填空
function renderSong(song){
  $author.text(song.artist)
  $title.text(song.title)
  $cover.attr("src",song.picture)
}


//获取歌词
function getLrc(id){
  $.ajax({
    url:"https://jirenguapi.applinzi.com/fm/getLyric.php?&sid=" + id,
    method:"get",
    dataType: "json"
  }).done(function(data){
    arrLrc(data)
    /*console.log(data.lyric)*/
  }).fail(function(){
    console.log("获取歌词失败！")
  })
}
//整理歌词
function arrLrc(data){
  var lyricArr=[]
  var lyric=data.lyric  //string
  var linesArr=lyric.split("\n")  //Array
  var timeRegular=/\[\d{2}:\d{2}\.\d{2}\]/g
  linesArr.forEach(function(item){
    if(!timeRegular.test(item)){
      linesArr.splice(item,1)
      return
    }
    var everyTime=item.match(timeRegular)
    var everyLyric=item.split(everyTime)
    var seconds=everyTime[0][1]*600+everyTime[0][2]*60+everyTime[0][4]*10+everyTime[0][5]*1
    lyricArr.push([seconds,everyLyric[1]])
  })
  appendLrc(lyricArr)
}
//拼装歌词，appendLrc
function appendLrc(lyricArr){
  var html="";
  for(var i=0;i<lyricArr.length;i++){
    html+='<li data-time="'+lyricArr[i][0]+'">'+lyricArr[i][1]+'</li>';
  }
  $(".lrcs").html(html)
}

//显示歌词
function slideLrc(){
  var lyricLis = $(".lrcs").find('li');
  var curTime=music.currentTime
  for(var i=0;i<lyricLis.length; i++){
    var curT=lyricLis.eq(i).attr("data-time")
    var nexT=lyricLis.eq(i+1).attr("data-time")
    if((curTime>curT)&&(curTime<nexT)){
      lyricLis.removeClass("active")
      lyricLis.eq(i).addClass("active");
    }
  }
}
//事件监听，当音乐播放时
music.addEventListener('playing', function(){
  timer = setInterval(function(){
  /*  updateProgress();*/
    setProgress()
    setTimeNode()
    slideLrc()
  }, 500);

});

//音乐暂停
$playBtn.on("click",function(){
  if($playBtn.hasClass('icon-pause')){
    music.pause()
    $playBtn.removeClass('icon-pause')
    $playBtn.addClass('icon-play')
  }else{
    music.play()
    $playBtn.removeClass('icon-play')
    $playBtn.addClass('icon-pause')
  }

})

//喜欢，变红
$heart.on('click',function(){
  if($(this).hasClass("active")){
    $heart.removeClass("active")
  }else{
    $heart.addClass("active")
  }
})
//同个频道的下一首
$nextBtn.on("click",function(){
  getMusicRandom(channelId)
  if($playBtn.hasClass("icon-play")){
    $playBtn.removeClass("icon-play");
    $playBtn.addClass("icon-pause");
  }
})

//点击进度条，调整播放时间
$progressBarNode.on("click", function(e) {
  var percent = e.offsetX / parseInt($(this).width())
  music.currentTime = percent * music.duration
  $progressNowNode.width(percent * 100 + "%")
})

//随着播放的进行，时间会变化
function setTimeNode(){
  var minute=parseInt(music.currentTime/60)
  var second=parseInt(music.currentTime%60)
  var minuteTotal=parseInt(music.duration/60)
  var secondTotal=parseInt(music.duration%60)

  if (second < 10) {
   second = "0" + second
 }
 if(secondTotal < 10){
   secondTotal="0"+secondTotal
 }
 $timeNode.text(minute + ":" + second +" / "+ minuteTotal+":"+secondTotal)
}

//随着播放的进行，进度条会变化
function setProgress(){
  var timeNowWidth=(music.currentTime/music.duration)*$progressBarNode.width()
  $progressNowNode.width(timeNowWidth)
}

//切换随机和循环
$loopBtn.on('click',function(){
  if($loopBtn.hasClass('icon-random')){
    isLoop=true
    $loopBtn.removeClass('icon-random')
    $loopBtn.addClass('icon-loop')
  }else{
    isLoop=false
    $loopBtn.removeClass('icon-loop')
    $loopBtn.addClass('icon-random')
  }
})
//播放时触发,设置循环播放或随机播放
music.ontimeupdate=function(){
  if(music.ended&&isLoop){
    music.play()
  }else if(music.ended && !isLoop){
    getMusicRandom(channelId)
    music.play()
  }
}
//静音切换操作
$volBtn.on("click",function(){
  if($(this).hasClass('icon-volume')){
    music.volume=0
    $(".vol-bar>span").siblings().removeClass("active")
    $volBtn.removeClass('icon-volume')
    $volBtn.addClass('icon-quiet')
  }else{
    music.volume=0.5
    $volBtn.removeClass('icon-quiet')
    $volBtn.addClass('icon-volume')
    $(".vol-bar>span").siblings().removeClass("active")
    $(".vol-bar>span").eq(2).addClass("active")
  }
})

//调节音量条
$volBar.on("click","span",function(e){
  if($volBtn.hasClass('icon-quiet')){
    $volBtn.removeClass('icon-quiet')
    $volBtn.addClass('icon-volume')
  }
  var idx=$(this).index()
  $(this).siblings().removeClass("active")
  $(this).addClass("active")
  music.volume=(4-idx)/4
  console.log("gg")
})
