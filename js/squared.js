var canvas = document.createElement('canvas');
var canvas2 = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var virtualCtx = canvas2.getContext('2d');
var width = 0;
var x = 0;
var y= 0;
var startX = 0;
var startY = 0;
var endX = 0;
var endY = 0;
var tolerance = 20;
var timeout = null;
var timeoutDraw = null;
var Square =
{
    type : 'horizontal',
    sourceImage: null,
    firstLoad: true,
    colors: ['red', 'green', 'black', 'grey', 'white'],
    color: localStorage.getItem("arrow_color"),
    currentColorIndex: null,
    saveToImage: function()
    {
        Canvas2Image.saveAsPNG(canvas, false, canvas.width, canvas.height);
    },
    getPixel: function(x, y)
    {
        var imageData = virtualCtx.getImageData(x-1, y-1, 1, 1);
        return imageData.data;
    },

    move: function (event)
    {
        console.log(event);
        x = event.clientX;
        y = event.clientY;
        Square.calculate();
    },

    calculate: function()
    {
        ctx.drawImage(Square.sourceImage,0,0, Square.sourceImage.width, Square.sourceImage.height);
        var currentPixel = Square.getPixel(x, y);

        if (Square.type == 'horizontal' || Square.type == 'both')
        {
            startX = x - 1;
            while (Square.isSamePixel(currentPixel, Square.getPixel(startX, y), tolerance) && startX > 0)
            {
                startX--;
            }
            endX = x + 1;
            while (Square.isSamePixel(currentPixel, Square.getPixel(endX, y), tolerance) && endX < Square.sourceImage.width)
            {
                endX++;
            }

        }

        if (Square.type == 'vertical' || Square.type == 'both')
        {
            startY = y - 2;
            while (Square.isSamePixel(currentPixel, Square.getPixel(x, startY), tolerance) && startY > 0)
            {
                startY--;
            }
            endY = y + 1;
            while (Square.isSamePixel(currentPixel, Square.getPixel(x, endY), tolerance) && endY < Square.sourceImage.height)
            {
                endY++;
            }
        }
        $("#debug").html(endX--);
        endX--;
        endY-=2;
        Square.draw();
    },

    draw: function()
    {
        Square.color = Square.colors[Square.currentColorIndex];

        ctx.drawImage(Square.imageWithDimensions,0,0,Square.imageWithDimensions.width,Square.imageWithDimensions.height);
        if(Square.color == 'black')
        {
            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        }
        else if(Square.color == 'green')
        {
            ctx.strokeStyle = "rgba(0, 120, 0 , 0.5)";
        }
        else if(Square.color == 'grey')
        {
            ctx.strokeStyle = "rgba(192,192,192 , 0.5)";
        }
        else if(Square.color == 'white')
        {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        }
        else if(Square.color == 'red')
        {
            ctx.strokeStyle = "rgba(200, 0, 0, 0.5)";
        }

        if (Square.type == 'horizontal' || Square.type == 'both')
        {
          ctx.beginPath();
          ctx.moveTo(startX, y + 0.5);
          ctx.lineTo(endX, y + 0.5);
          ctx.stroke();

          ctx.moveTo(startX + 0.5, y - 1);
          ctx.lineTo(startX + 0.5, y + 2);

          ctx.moveTo(endX + 0.5, y - 1);
          ctx.lineTo(endX + 0.5, y + 2);
          ctx.stroke();
        }
        if (Square.type == 'vertical' || Square.type == 'both')
        {
          ctx.beginPath();
          ctx.moveTo(x + 0.5, startY + 0.5);
          ctx.lineTo(x + 0.5, endY + 0.5);
          ctx.stroke();

          ctx.moveTo(x - 1, startY + 0.5);
          ctx.lineTo(x + 2, startY + 0.5);

          ctx.moveTo(x - 1, endY + 0.5);
          ctx.lineTo(x + 2, endY + 0.5);
          ctx.stroke();
        }

        var hStringX = endX - 20;
        var hStringY = y - 6;

        var vStringX = x + 3;
        var vStringY = startY + 10;

        var minDistance = 20;
        if (Square.type == 'horizontal')
        {
            hStringX = x - 5;
        }
        else if (Square.type == 'vertical')
        {
            vStringY = y;
        }
        else if (Square.type == 'both')
        {
            if (Math.abs(y - vStringY) < minDistance)
            {
                vStringY = endY - 8;
            }
            if (Math.abs(x - hStringX) < minDistance)
            {
                hStringX = startX + 3;
            }

            if (Math.abs(hStringX - vStringX) < minDistance && Math.abs(hStringY - vStringY) < minDistance)
            {
                hStringX = startX + 3;
                vStringY = endY - 8;
            }
        }

        if (Square.type == 'horizontal' || Square.type == 'both')
        {
            ctx.strokeText((endX - startX) + 1, hStringX, hStringY);
        }
        if (Square.type == 'vertical' || Square.type == 'both')
        {
            ctx.strokeText((endY - startY) + 1, vStringX, vStringY);
        }
    },
    isSamePixel: function (originPixel, otherPixel, tolerance)
    {
        return ((Math.abs(originPixel[0] - otherPixel[0])
            + Math.abs(originPixel[1] - otherPixel[1])
            + Math.abs(originPixel[2] - otherPixel[2])) / 3) <= tolerance;
    },
    drop: function()
    {
        $('#image-test').attr("src", window.event.dataTransfer.getData("URL"));
        Square.init();
    },
    cancelEvent:  function()
    {
        window.event.returnValue = false;
    },
    init : function()
    {
        Square.currentColorIndex = 0;
        if (Square.color)
        {
            Square.currentColorIndex = Square.colors.indexOf(Square.color);
            console.log(Square.currentColorIndex);
            console.log(Square.color);
        }

        newImg = $('#source_image').get(0);
        Square.sourceImage = $('#source_image').get(0);

        Square.imageWithDimensions = new Image();
        Square.imageWithDimensions.src = Square.sourceImage.src;
        //$('body').append(Square.imageWithDimensions);

        newImg.onload = function()
        {
            newImg = $('#source_image').get(0);
            canvas2.width = newImg.width;
            canvas2.height = newImg.height;
            virtualCtx.drawImage(Square.sourceImage, 0,0);
            Square.firstLoad = false;
            source = newImg.src;
            console.log(newImg.width + '/' + newImg.height);
            canvas.width = newImg.width;
            canvas.height = newImg.height;
            canvas.id = 'toto';
            ctx.drawImage(Square.sourceImage, 0,0);
            document.getElementsByTagName('body')[0].appendChild(canvas);
            //newImg.src = null;
            //newImg.style.display = 'none';

            started = false;

            $('canvas').mousemove(function(event){
                 Square.move(event);
             });


            $('canvas').click(function(event){
                Square.imageWithDimensions.src = canvas.toDataURL();
                Square.draw();
            });

            $(document).keyup(function(event){
                console.log(event.keyCode);
              switch(event.keyCode)
              {
                  // CLEAR
                  case 8: // "backspace" key
                      Square.imageWithDimensions.src = Square.sourceImage.src;
                      Square.draw();
                      break;

                  case 88: // "x" key
                      if (Square.type == 'horizontal')
                      {
                          Square.type = 'vertical';
                      }
                      else if (Square.type == 'vertical')
                      {
                          Square.type = 'both';
                      }
                      else if (Square.type == 'both')
                      {
                          Square.type = 'horizontal';
                      }
                      Square.calculate();
                      break;


                  // HORIZONTAL RULER
                  case 37: // "left" key
                  case 39: // "right" key
                      Square.type = 'horizontal';
                      Square.calculate();
                      break;

                  // VERTICAL RULER
                  case 38: // "up" key
                  case 40: // "down" key
                      Square.type = 'vertical';
                      Square.calculate();
                      break;

                  // Square.color
                  case 67: //"c" key
                      Square.currentColorIndex++;
                      if (Square.currentColorIndex > Square.colors.length - 1)
                      {
                          Square.currentColorIndex = 0;
                      }
                      localStorage.setItem("arrow_color", Square.colors[Square.currentColorIndex]);
                      //safari.extension.settings.setItem('arrow_color', Square.colors[Square.currentColorIndex]);

                      Square.draw();
                      break;

              }
            });
        }
    }
};

$(document).ready(function(){
  if (window.FileReader) {
    function handleFileSelect(evt) {
      var files = evt.target.files;
      var f = files[0];
      var reader = new FileReader();

        reader.onload = (function(theFile) {
          return function(e) {
            $('body').append
            (
                $('<img/>')
                    .attr('id', 'source_image')
                    .attr('src', e.target.result).hide()
                );
            // $('#image').attr('src', e.target.result);
            //$('#image').hide();
            //document.getElementById('list').innerHTML = ['<br/><br/><img id="image" src="', e.target.result,'" title="', theFile.name, '"/>'].join('');
            Square.init();
          };
        })(f);

        reader.readAsDataURL(f);
    }
   } else {
    alert('This browser does not support FileReader');
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);
})
