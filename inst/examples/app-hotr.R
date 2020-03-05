library(shiny)
library(hotr)

ui <- fluidPage(
  column(4,
         verbatimTextOutput("debug")
  ),
  column(4,
        uiOutput('dstable')
  ),
  column(4,
         hotr("indata2", data = cars)
  )
)
server <- function(input,output,session){

  output$dstable <- renderUI({
    hotr("indata1", data = mtcars, options = list(height = 300), order = c('cyl'))
  })

  output$debug <- renderPrint({
    str(input$indata1)
    hotr_table(input$indata1, selected = TRUE)
  })
}
shinyApp(ui,server)


