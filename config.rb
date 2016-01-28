set :css_dir,               'css'
set :js_dir,                'js'
set :images_dir,            'img'
set :fonts_dir,             'fonts'
set :js_compressor, Uglifier.new(:mangle => false)

# Slim template engine
require 'slim'

# explicit require of sass as suggested by 'tilt'
require 'sass'

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false


  activate :gzip
# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

###
# Helpers
###

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

# Build-specific configuration
configure :build do
  # Minify CSS on build
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript

  activate :minify_html

end

# work-around to remove copies of font-awesome files. Where are they pulled in?
after_build do |builder|
  build_dir = config[:build_dir]
  Dir.glob(build_dir + '/fonts/*wesome*').each { |f| File.delete(f) if File.file? f }
end

activate :s3_sync do |s3_sync|
  s3_sync.bucket                     = 'www.tagmento.com' # The name of the S3 bucket you are targetting. This is globally unique.
  s3_sync.region                     = 'us-east-1'     # The AWS region for your bucket.
  #s3_sync.aws_access_key_id          = 'AWS KEY ID'
  #s3_sync.aws_secret_access_key      = 'AWS SECRET KEY'
  s3_sync.delete                     = true # We delete stray files by default.
  s3_sync.after_build                = true # We do not chain after the build step by default.
  s3_sync.prefer_gzip                = true
  s3_sync.path_style                 = true
  s3_sync.reduced_redundancy_storage = false
  s3_sync.acl                        = 'public-read'
  s3_sync.encryption                 = false
  #s3_sync.prefix                     = ''
  s3_sync.version_bucket             = false
  s3_sync.index_document             = 'index.html'
  s3_sync.error_document             = '404.html'
end
