library(shiny)
library(hotr)

ui <- fluidPage(
  column(4,
         verbatimTextOutput("debug")
  ),
  column(4,
         hotr("indata1", data = cars, enable_hdTypes = FALSE),
         br()
  ),
  column(4,
        uiOutput('dstable')
  )
)
server <- function(input,output,session){

  output$dstable <- renderUI({
    hotr("indata2", data = mtcars, options = list(height = 300),
         order = c('cyl'), enable_hdTypes = TRUE)
  })

  output$debug <- renderPrint({
    str(cars)
    str(input$indata2)
    hotr_table(input$indata1, selected = FALSE)
  })
}
shinyApp(ui,server)


