Asciidoctor::Converter.for 'html5'
# => Asciidoctor::Converter::Html5Converter

#https://docs.asciidoctor.org/asciidoctor/latest/convert/custom/
class MyHtml5Converter < (Asciidoctor::Converter.for 'html5')
  register_for 'html5'

  def convert_paragraph node
    logger.warn 'Converting a paragraph...'
    super
  end
end
