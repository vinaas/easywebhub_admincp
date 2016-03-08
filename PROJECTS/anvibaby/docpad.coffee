# DocPad Configuration File
# http://docpad.org/docs/config

# Define the DocPad Configuration
moment = require('moment')

docpadConfig = {
	outPath: 'public'  # default

	templateData:
		# Site Data
		site:
			url: "http://anvibaby.com"
			title: "Tã Vải Hiện Đại AnViBaby"
			author: "Anvibaby"
			description: 'Tã Vải Hiện Đại AnViBaby'
			email: "anvibaby@gmail.com"
			productIdDefault: "Size-M-Day"
			image: "/img/logo/logo.png"

		getPreparedTitle: -> if @document.title then "#{@document.title} | #{@site.title}" else @site.title
		getProductIdName: -> if @document.productIdName then "#{@document.productIdName}" else @site.productIdDefault
		getMetaImage: -> if @document.images then "/#{@document.images[0].url}" else if @document.thumbnail then "/#{@document.thumbnail}" else @site.image
		getMetaDescription: -> if @document.sDescription then "#{@document.sDescription}" else @site.description
		currentYear: -> new Date().getFullYear()
		time : (ts, format) ->
			format = format || 'DO MMMM , YYYY'
			ts = new Date(ts) || new Date()
			moment(ts).format(format)
	collections:
      products: ->
          @getCollection("html").findAllLive({isProduct:true}, {ngaydang: -1})

			bestsellerProducts: ->
			    @getCollection("html").findAllLive({bestseller:true}, {ngaydang: -1})
	 # Environments
  # Allows us to set custom configuration for specific environments
  environments:  # default
			development:  # default
				hostname:  'localhost'
				port: 3000  # example
				# hostname: '127.0.0.1'
				#
				# port: 9005  # example
          # Always refresh from server
          # maxAge: false  # default

          # # Only do these if we are running standalone via the `docpad` executable
          # checkVersion: process.argv.length >= 2 and /docpad$/.test(process.argv[1])  # default
          # welcome: process.argv.length >= 2 and /docpad$/.test(process.argv[1])  # default
          # prompts: process.argv.length >= 2 and /docpad$/.test(process.argv[1])  # default

          # Listen to port 9005 on the development environment

			production:
				hostname:  'docpad.anvibaby.com'
				port: 8080  # example
	# port:2000
}

# Export the DocPad Configuration
module.exports = docpadConfig
