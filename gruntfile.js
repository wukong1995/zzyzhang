module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      jade: {
        files: ['views/**'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['models/**/*.js', 'schemas/**/*.js'],
        // tasks: ['jshint'],
        options: {
          livereload: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          args: [],
          ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
          watchedExtensions: ['js'],
          watchedFolders: ['./'],
          debug: true,
          delayTime: 1,
          env: {
            PORT: 3000
          },
          cwd: __dirname
        }
      }
    },
    mochaTest: {
      option: {
        reporter: 'spec'
      },
      src: ['test/**/*.js']
    },
    concurrent: {
      tasks: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    }
  });

  // 如果有文件修改，则自动重启保存的任务
  grunt.loadNpmTasks('grunt-contrib-watch');

  // 实时监控app.js是否改动,如果改动,自动重启
  grunt.loadNpmTasks('grunt-nodemon');

  // 针对慢任务开发的组件
  grunt.loadNpmTasks('grunt-concurrent');

  // 测试模块
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.option('force', true);
  grunt.registerTask('default', ['concurrent']);
  grunt.registerTask('test', ['mochaTest']);
};
