(function( $ ){
    var s,
        m = {
            slideToThis : function(e)
            {
                var galleryObj = e.data.galleryObj,
                    thisItem,
                    controls =  typeof $(e.target).data('controls') !== 'undefined' ? true : false;

                if(controls){
                    if($(e.target).data('controls'))
                    {
                        thisItem = galleryObj.prev;
                        m.slideLeft(thisItem,galleryObj);
                        m.slideRight(thisItem,galleryObj);
                    }
                    else
                    {
                        thisItem = galleryObj.next;
                        m.slideLeft(thisItem,galleryObj);
                        m.slideRight(thisItem,galleryObj);
                    }
                }
                else
                {
                    thisItem = $(e.target).parent();
                }
                if(thisItem.get(0) !== galleryObj.center.thumb.get(0))
                {
                    galleryObj.center.thumb.removeClass('centered');
                    galleryObj.center.thumb = thisItem.addClass('centered');
                    m.setCenter(galleryObj);
                }

            },

            setCenter : function(galleryObj)
            {
                var centerThumb = galleryObj.center.thumb,
                    index = centerThumb.index(),
                    allObjects = galleryObj.center.main.children(),
                    mainObject = allObjects.eq(index),
                    objectCaption = mainObject.data('caption'),
                    videoContainer = $('.video-container');

                if(videoContainer.children('iframe').length > 0) // if there are any videos in this gallery
                {
//                    videoContainer.children('div.youtube-after').fadeIn();

                    videoContainer.children('iframe').each(function(){
                        var iframe = $(this);
                        iframe.siblings('div.youtube-after').fadeIn();
                        iframe.fadeOut('slow',function(){
                            iframe.remove();
                        });
                    });
                }
                m.changeCaption(galleryObj, objectCaption);

                allObjects.not(mainObject).fadeOut('slow');
                mainObject.fadeIn('slow');

                galleryObj.next = m.getNextItem(galleryObj);
                galleryObj.prev = m.getPrevItem(galleryObj);
            },

            changeCaption : function(galleryObj, caption)
            {
                var oldCaption = galleryObj.caption.children().fadeOut(),
                    newCaption = $('<span>'+caption+'</span>');

                newCaption.hide().appendTo(galleryObj.caption).fadeIn();
                oldCaption.remove();
            },

            getNextItem : function(galleryObj)
            {
                if(galleryObj.center.thumb.get(0) === galleryObj.thumbsList.last().get(0))
                {
                    return galleryObj.thumbsList.first();
                }
                else
                {
                    return galleryObj.center.thumb.next();
                }
            },

            getPrevItem : function(galleryObj)
            {
                if(galleryObj.center.thumb.get(0) === galleryObj.thumbsList.first().get(0))
                {
                    return galleryObj.thumbsList.last();
                }
                else
                {
                    return galleryObj.center.thumb.prev();
                }
            },

            addFunctions : function(galleryObj)
            {
                galleryObj.thumbsList.on('click', {galleryObj : galleryObj}, m.slideToThis);
                galleryObj.controls.left.on('click', {galleryObj : galleryObj}, m.slideToThis);
                galleryObj.controls.right.on('click', {galleryObj : galleryObj}, m.slideToThis);
            },

            removeFunctions : function(galleryObj)
            {
                galleryObj.thumbsList.off('click');
                galleryObj.controls.left.off('click');
                galleryObj.controls.right.off('click');
            },

            preload : function(galleryObj)
            {
                var count = new Object(),
                    first = true;

                count.counter = 0;

                $(galleryObj.thumbsList).each(function()
                {
                    var src = $(this).children().data('src'),
                        type = $(this).children().data('type'),
                        caption = $(this).children().data('caption'),
                        element;

                    if(type == 'youtube')
                    {
                        var id = src,
                            element = $('<div></div>').addClass('video-container').data('id',id).data('galleryObj',galleryObj).data('caption', caption)
                                .hide().appendTo(galleryObj.center.main).click(m.playVideo),
                            preview = $('<img/>').appendTo(element),
                            marginTop = (element.height() - 75) / 2,
                            marginLeft = (element.width() - 100) / 2;


                        $('<div></div>').addClass('youtube-after').appendTo(element).css({top :marginTop+'px', left : marginLeft+'px'});

                        $.getJSON("http://gdata.youtube.com/feeds/api/videos/"+id+"?v=2&alt=jsonc&callback=?", function(json)
                        {
                            src = json.data.thumbnail.hqDefault;

                            preview.attr('src', src);

                            if(first)
                            {
                                first = false;
                                element.show();
                            }
                        });
                    }
                    else if(type == 'img')
                    {
                        element = $('<div></div>').addClass('img-container').data('caption', caption).hide().appendTo(galleryObj.center.main);

                        var img = $('<img/>').attr('src', src).appendTo(element).load(m.resizeIMG);

                        if(first)
                        {
                            first = false;
                            element.show();
                        }
                    }
                });
            },

            showSpinner : function(show, target, galleryObj)
            {
                var galleryObj =  typeof galleryObj !== 'undefined' ? galleryObj : target.data('galleryObj');

                if(show)
                {
                    var placeholder = target.parent(),
                        marginTop = (placeholder.height() - 42) / 2,
                        marginLeft = (placeholder.width() - 42) / 2;

                    galleryObj.spinner = new Object();
                    galleryObj.spinner.item = $('<div class="spinner"></div>').css({top :marginTop+'px', left : marginLeft+'px'});
                    galleryObj.spinner.wrapper = $('<div class="spinner-wrapper"></div>').append(galleryObj.spinner.item).hide().appendTo(placeholder).fadeIn('fast');
                }
                else if(typeof galleryObj.spinner !== 'undefined')
                {
                    galleryObj.spinner.wrapper.hide().remove();
                    galleryObj.spinner.item.fadeOut('fast', function()
                    {
                        $(this).remove();
                    });
                }
            },

            slideLeft : function(thisItem,galleryObj)
            {
                var objectOffset = 0,
                    offset = galleryObj.thumbsContainer.get(0).offsetLeft,
                    visibleUntil = galleryObj.thumbsWrapper.width() + offset - (offset * 2);

                galleryObj.thumbsList.each(function(index,value)
                {
                    objectOffset += $(value).outerWidth(true);

                    if(index == thisItem.index())
                    {
                        return false;
                    }
                });

                if(objectOffset > visibleUntil)
                {
                    var diff = objectOffset - visibleUntil;
                    galleryObj.thumbsContainer.animate({'margin-left' : '-='+diff},'fast');
                }

            },

            slideRight : function(thisItem,galleryObj)
            {
                var objectOffset = 0,
                    offset = galleryObj.thumbsContainer.get(0).offsetLeft,
                    visibleUntil = offset - (offset * 2);

                galleryObj.thumbsList.each(function(index,value)
                {
                    if(index == thisItem.index())
                    {
                        return false;
                    }
                    else
                    {
                        objectOffset += $(value).outerWidth(true);
                    }
                });

                if(objectOffset < visibleUntil)
                {
                    var diff = objectOffset - visibleUntil;
                    galleryObj.thumbsContainer.animate({'margin-left' : '-='+diff},'fast');
                }
            },

            slideThumbs : function(galleryObj)
            {
                m.showSpinner(true, galleryObj.center.main, galleryObj);
                $(window).load(function(){
                    galleryObj.controls.wrapper.fadeIn('slow');
                    galleryObj.thumbsList.fadeIn('slow');
                    m.showSpinner(false,galleryObj.center.main, galleryObj);
                    var MouseRelXpos = 0,
                        sumW = 0;
                    // auto-SET mmGallery_container WIDTH ()
                    galleryObj.thumbsList.each(function(){
                        sumW += $(this).outerWidth(true); // collect all images widths
                        galleryObj.thumbsContainer.width(sumW);//SET gallery WIDTH!
                    });
                    // Calculate "compensation speed": width difference between the gallery container and the gallery
                    wDiff1 = galleryObj.thumbsWrapper.width();
                    wDiff2 = galleryObj.thumbsContainer.width();
                    wDiff = (wDiff2/wDiff1)-1;  //(-1 is for the already existant container width)
                    //#

                    if(sumW > wDiff1){
                        var xSlider = galleryObj.thumbsContainer;     // cache
                        var posX = 0;
                        var moseoverInterval;

                        galleryObj.thumbsWrapper.mouseenter(function(){
                            moseoverInterval = setInterval(function(){
                                posX += (- MouseRelXpos - posX) / 14; // 14 = speed (higher val = slower animation)
                                xSlider.css({marginLeft:  Math.round(posX * wDiff) +"px" }); // instead "marginLeft" use "left" for absolute pos. #mmGallery
                            }, 10); // 10 = loop timeout
                        });
                        galleryObj.thumbsWrapper.mouseleave(function(){
                            clearInterval(moseoverInterval);
                        })
                        galleryObj.thumbsWrapper.mousemove(function(e)
                        {
                            MouseRelXpos = (e.pageX - this.offsetLeft); // = mouse pos. "minus" offsetLeft of this element

                        });
                    }
                });
            },

            playVideo : function(e)
            {
                var container = $(this),
                    iframe = $('<iframe type="text/html" src="https://www.youtube.com/embed/'+container.data('id')+'?autoplay=1&rel=0&showinfo=0" frameborder="0" allowfullscreen></iframe>');

                container.find('.youtube-after').hide();
                m.showSpinner(true, container);
                iframe.hide().appendTo(container).load(function(){
                    m.showSpinner(false, container);
                    $(this).fadeIn('slow');
                })
            },

            resizeIMG : function(e)
            {

                var IMG = $(e.target),
                    chldW = e.target.width,
                    chldH = e.target.height,
                    chldRatio = chldW/chldH,
                    prntW = IMG.parent().width(),
                    prntH = IMG.parent().height(),
                    prntRatio = prntW/prntH,
                    margin = 0;

                if(chldRatio > 1 && chldRatio >= prntRatio)
                {
                    var height = chldH;

                    if (chldW > prntW || s.strechIMG)
                    {
                        var sizeDiff = s.strechIMG == true ? prntW/chldW: chldW/prntW;
                        height = Math.round(chldH * sizeDiff);
                        IMG.width(prntW);
                    }
                    margin = (prntH - height) / 2;
                }
                else
                {
                    if(chldH > prntH || s.strechIMG)
                    {
                        IMG.height(prntH);
                    }
                    else
                    {
                        margin = (prntH - chldH)/2;
                    }
                }
                IMG.css('margin-top', margin + 'px');
            }
        };
    $.fn.mediaGallery = function(o){
        s = {
            itemClass       : 'li',
            galleryClass : 'gallery-wrapper',
            centerClass : 'gallery-center',
            mainItemClass : 'gallery-mainItem',
            thumbsWrapperClass : 'gallery-thumbsWrapper',
            captionClass : 'gallery-caption',
            spinnerClass : 'spinner',
            spinnerWrapperClass : 'spinner-wrapper',
            contolsWrapperClass : 'gallery-controls',
            contolsLeftClass : 'gallery-slideLeft',
            contolsRightClass : 'gallery-slideRight',
            contolsLeftTitle : 'Previous',
            contolsRightTitle : 'Next',
            strechIMG : true
        };
        if(o) $.extend(s, o);

        this.each(function(){

            var galleryObj = new Object(),
                galleryMainView = $('<div class="'+ s.centerClass+'"></div>'),                               // Creates gallery's main view
                galleryWrapper = $('<div class="'+ s.galleryClass+'"></div>').prepend(galleryMainView),      // Creates gallery's wrapper and prepends gallery's main view to it
                thumbsWrapper = $('<div class="'+s.thumbsWrapperClass+'"></div>').appendTo(galleryWrapper),   // Creates gallery's thumb list wrapper and appends it gallery's wrapper
                thumbsList = $(this).before(galleryWrapper).appendTo(thumbsWrapper);                         // Takes thumb list and inserts gallery wrapper before it, then appends thumb list to thumb wrapper

            galleryObj.thumbsWrapper = thumbsWrapper;
            galleryObj.thumbsContainer = thumbsList;
            galleryObj.thumbsList = thumbsList.find(s.itemClass).hide();

            galleryObj.caption = $('<div class="'+ s.captionClass+'">').insertAfter(galleryMainView);


            galleryObj.center = new Object();
            galleryObj.center.main = $('<div class="'+ s.mainItemClass+'">').prependTo(galleryMainView);
            galleryObj.center.thumb = galleryObj.thumbsList.first().addClass('centered');

            galleryObj.controls = new Object();
            galleryObj.controls.wrapper   = $('<div class="'+s.contolsWrapperClass+'"></div>').appendTo(galleryMainView).hide();
            galleryObj.controls.left = $('<div class="'+s.contolsLeftClass+'" title="'+s.contolsLeftTitle+'"></div>').appendTo(galleryObj.controls.wrapper).data('controls',true);
            galleryObj.controls.right = $('<div class="'+s.contolsRightClass+'" title="'+s.contolsRightTitle+'"></div>').appendTo(galleryObj.controls.wrapper).data('controls',false);

            m.preload(galleryObj);
            m.addFunctions(galleryObj);
            m.setCenter(galleryObj);
            m.slideThumbs(galleryObj);

        });
    }
})( jQuery );