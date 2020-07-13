const fs = require('fs')
const path = require('path')
const process = require('child_process');
const iconv = require('iconv-lite');
const main = () => {

    initFolder()
    let tasks = []
    diguiFolder(path.resolve(__dirname, '.'), tasks)
    console.log(tasks);
    runTasks(tasks)
}
const destFolder = path.resolve(__dirname, 'dest')
const initFolder = () => {
    let exist = fs.existsSync(destFolder)
    if (!exist) {
        fs.mkdirSync(destFolder)
    }

}
let bv = 1
const diguiFolder = (dir, tasks) => {
    let files = fs.readdirSync(dir)
    let target = {}
    files.forEach(item => {
        let fullpath = path.resolve(dir,item)
        if (/^audio/.test(item)) {
           
            target.audio = fullpath
            target.bv = bv++
        } else if (/^video/.test(item)) {
            target.video = fullpath
        } else {
            let isFolder = fs.statSync(path.resolve(dir, item)).isDirectory()

            if (isFolder) {
                diguiFolder(path.resolve(dir, item), tasks)
            }
        }
    })
    if (target.audio && target.video) {
        tasks.push(target)
    }
}

const runTasks = (tasks) => {
    let task = tasks.shift()
    runTask(task)
    if (tasks.length > 0) {
        runTasks(tasks)
    }
}

const runTask = (task) => {
    // ffmpeg -y -i ./video.mp4 -i ./audio.mp3 -c copy ./new1.mp4
    let folder = path.resolve(__dirname,'dest',task.bv.toString())
    if(!fs.existsSync(folder)){
        fs.mkdirSync(folder)
    }
    let dest = path.resolve(__dirname,'dest',task.bv.toString(),'output.mp4')
    console.log(dest);
    let cmd = ` ffmpeg -y -i ${task.video} -i ${task.audio} -c copy ${dest}`;
    let encoding = 'cp936';
    let binaryEncoding = 'binary';
    
    process.exec(cmd, {
        encoding: binaryEncoding
    }, function (err, stdout, stderr) {
        let out = iconv.decode(new Buffer(stdout, binaryEncoding), encoding)
        let er = iconv.decode(new Buffer(stderr, binaryEncoding), encoding)
        console.log(out);
        console.log(er);
    });
}


main()