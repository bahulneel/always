
/**
 * @list dependencies
 **/

var fs = require('fs')
  , path = require('path')
  , vows = require('vows')
  , assert = require('assert')
  , spawn = require('child_process').spawn;

/**
 * @description setup
 */

var testApp =
  'var http = require(\'http\');\n'+
  'console.log(process.argv.join(" "));\n' +
  'var app = http.createServer(function(request, response) {\n'+
  '  console.log(process.argv);\n'+ 
  '  response.end("hi");\n'+
  '});\n'+
  'app.listen(8000)';

/**
 * @description spawn config
 **/

var args = [
  path.join(__dirname, '..', 'bin', 'always.js'),
  path.join(__dirname, '..', 'test', 'app.js')
];

/**
 * @tests
 **/

vows.describe('always vows setup & teardown')

/**
 * @tests setup
 **/

.addBatch({
  'when creating file /test/app.js':{
    topic:function(){
      fs.writeFile(__dirname+'/app.js', testApp, 'utf8', this.callback);
    },
    'there should be no errors':function(error){
      assert.equal(typeof(error), 'undefined');
    }
  }
})

/**
 * @tests CLI
 */

.addBatch({
  'when running `always start app.js`':{
    topic:function() {
      var self = this;
      var child = spawn('node', args.concat(["--myarg", "blubb"])),
        stdout = '',
        stderr = '';
        exitCode = 0;
      child.stdout.on('data', function(data) {
        stdout += data;
      });
      child.stderr.on('data', function(data) {
        stderr += data;
      });
      child.on('exit', function(code) {
        exitCode = code;
      });
      setTimeout(function() {
        child.kill();
        self.callback(null, exitCode, stdout, stderr);
      }, 300);
    },
    'there should be no errors':function(error, exitCode, stdout, stderr){
      assert.isNull(error);
    },
    'the exit status code should be 0 (false for issues)':function(error, exitCode, stdout, stderr){
      assert.equal(exitCode, 0);
    },
    'stdout should not be an empty value':function(error, exitCode, stdout, stderr){
      assert.notEqual(stdout, '');
      assert.match(stdout, /.*\-\-myarg blubb/);
    },
    'stderr should be an empty value':function(error, exitCode, stdout, stderr){
      assert.equal(stderr, '');
    }
  }
})

/**
 * @tests teardown
 **/

.addBatch({
  'when removing /test/app.js':{
    topic:function(){
      fs.unlink(__dirname+'/app.js', this.callback);
    },
    'there should be no errors':function(error) {
      assert.equal(typeof(error), 'undefined');
    }
  }
})
.export(module);

/* EOF */