library(shiny)
library(hotr)

ui <- fluidPage(
  column(4,
         verbatimTextOutput("debug")
  ),
  column(4,
         hotr("indata1", data = cars, enable_hdTypes = FALSE),
         verbatimTextOutput("debug_input1"),
         br()
  ),
  column(4,
        uiOutput('dstable'),
        verbatimTextOutput("debug_input2")
  )
)
server <- function(input,output,session){

  output$dstable <- renderUI({
    hotr("indata2", data = mtcars, options = list(height = 300),
         order = c('cyl'), enable_hdTypes = TRUE)
  })

  output$debug <- renderPrint({
    str(input$indata1)
    str(input$indata2)
  })

  output$debug_input1 <- renderPrint({
    hotr_table(input$indata1)
    hotr_fringe(input$indata1)
  })

  output$debug_input2 <- renderPrint({
    hotr_table(input$indata2)
    hotr_fringe(input$indata2)
  })

}
shinyApp(ui,server)


