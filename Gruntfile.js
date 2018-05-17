module.exports = function(grunt) {
  // Nacteme vsechny grunt tasky a urychlime srandu
  require("jit-grunt")(grunt);

  grunt.initConfig({
    less: {
      default: {
        files: {
          "css/style.css": "less/index.less"
        },
        options: {
          sourceMap: true,
          sourceMapFilename: "css/style.css.map",
          sourceMapURL: "rekrea.css.map",
          sourceMapRootpath: ""
        }
      }
    },

    postcss: {
      options: {
        processors: [require("autoprefixer")()]
      },
      default: {
        src: ["css/style.css"]
      }
    },

    browserSync: {
      default: {
        bsFiles: {
          src: ["css/style.css"]
        },
        options: {
          watchTask: true,
          server: {
            baseDir: "./"
          }
        }
      }
    },

    prettier: {
      css: {
        src: ["less/**/*.less", "!less/lib/**/*"]
      },
      js: {
        src: ["Gruntfile.js", "js/*.js"]
      }
    },

    stylelint: {
      options: {
        configFile: ".stylelintrc",
        formatter: "string",
        ignoreDisables: false,
        failOnError: true,
        outputFile: "",
        reportNeedlessDisables: false,
        syntax: "less"
      },
      src: ["less/**/*.less", "!less/lib/**/*"]
    },

    watch: {
      default: {
        files: ["less/**/*.less"],
        tasks: ["css"]
      }
    }
  });

  grunt.registerTask("css", ["newer:prettier:css", "less", "postcss"]);
  grunt.registerTask("default", ["browserSync", "watch"]);
};
