require 'rubygems'
gem 'rego-ruby-ext'
require "rego-ruby-ext"
gem 'rego-js-builder'
require "rego-js-builder"
gem 'rake-hooks'
require 'rake/hooks'

project = JsProjectBuilder.new(
  :name => 'jqDialog',
  :description => 'jQuery plugin for creating dialog hovering div',
  :file_name => 'jquery.dialog.js',
  :js_files => %w{base.js dialog.js type-simple.js type-confirm.js},
  :sass => true
)
JsProjectBuilder::Tasks.new(project)

# copy i18n files to dist
after :js do
  puts "Copying i18n files..."
  cp_r File.join('src', 'i18n'), File.join(project.dist_dir, 'i18n')
end
