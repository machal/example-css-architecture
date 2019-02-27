module.exports = function(grunt) {
  const sass = require("node-sass");

  // Nacteme vsechny grunt tasky a urychlime srandu
  require("jit-grunt")(grunt);

  grunt.initConfig({
    sass: {
      options: {
        implementation: sass,
        sourceMap: true
      },
      default: {
        files: {
          "css/style.css": "scss/index.scss"
        }
      }
    },

    postcss: {
      options: {
        map: true,
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
        src: ["scss/**/*.scss", "!scss/lib/**/*"]
      },
      js: {
        src: ["Gruntfile.js", "js/*.js"]
      }
    },

    stylelint: {
      options: {
        syntax: "scss"
      },
      src: ["scss/components-new/**/*.scss"]
    },

    watch: {
      default: {
        files: ["scss/**/*.scss"],
        tasks: ["css"]
      }
    }
  });

  grunt.registerTask("css", ["sass", "postcss"]);
  grunt.registerTask("default", ["browserSync", "watch"]);
};
