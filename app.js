const Koa = require('koa2'),
    Router = require('koa-router'),
    cheerio = require('cheerio'),
    app = new Koa(),
    router = new Router(),
    superagent = require('superagent'),
    views = require('koa-views'),
    pug = require('pug'),
    path = require('path'),
    http = require('https'),
    fs = require("fs");
require('superagent-charset')(superagent);

// 配置模板文件目录和后缀名
app.use(views(path.join(__dirname + '/views'), {
    extension: 'pug'
})).use(router.routes())
    .use(router.allowedMethods());

router.get('/*', async function (ctx, next) {
    let totalPages = ctx.request.url.split('/')[1] || 1;
    let URL = 'https://haokan.baidu.com/videoui/api/videorec?tab=yingshi&act=pcFeed&pd=pc&num=20&shuaxin_id=1585026867586';
    let urlArr = [];
    function getUrl() {
        return new Promise((resolve) => {
            superagent.get(URL).charset('utf-8').end((err, html) => {
                let text = JSON.parse(html.text),
                    $ = cheerio.load(text), url = '', itemArr = text.data.response.videos, obj = {};
                itemArr.map(function (item) {
                    url = item.play_url;
                    console.log("url", url)
                    if (url) {
                        obj = {
                            title: item.title,
                            url: item.play_url
                        }
                        urlArr.push(obj);
                        if (!fs.existsSync(`E:/video/dd/${item.title}.mp4`)) {
                            download(url, item.title);
                        } else {
                            console.log(`电影--${item.title}.mp4已经存在`);
                        }

                    }
                });
                resolve(1);
            })
        })
    }
    for (let i = 0; i < totalPages; i++) {
        await getUrl(i);
    }
    await ctx.render('image.pug', {
        "imgUrls": urlArr
    });
})
function download(url, fileName) {
    http.get(url, function (req) {
        var imgData = '';
        req.setEncoding('binary');
        req.on('data', function (chunk) {
            imgData += chunk;
        })
        //req.setEncoding('UTF-8');
        req.on('end', function () {
            try {
                fs.writeFile(`E:/video/dd/${fileName}.mp4`, imgData, 'binary', function (err) {
                    if (err) {
                        console.log('err', err)
                    } else {
                        console.log('视频下载成功', fileName)
                    }

                })
            } catch (e) {
                console.log(e)
            }

        })
    })
}
app.listen(3000, () => {
    console.log('[服务已开启,访问地址为：] http://127.0.0.1:3000/');
});


