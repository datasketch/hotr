library(shiny)
library(hotr)
library(datafringe)

ui <- fluidPage(
  column(4,
         verbatimTextOutput("debug")
  ),
  column(4,
        uiOutput('dstable')
  ),
  column(4,
         hotr("indata2", data = cars, options = list(height = 200))
  )
)
server <- function(input,output,session){

  output$dstable <- renderUI({
    hotr("indata1", data = mtcars, options = list(height = 300))
  })

  output$debug <- renderPrint({
    str(input$indata1)
  })
}
shinyApp(ui,server)


