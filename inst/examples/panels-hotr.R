library(shiny)
library(hotr)
library(shinypanels)

styles <- "
.panel-content {
  height: 100%;
}
"

ui <- panelsPage(
  styles = styles,
  panel(title = "First Panel", color = "chardonnay", collapsed = FALSE, width =  350,
        head = NULL,
        body = verbatimTextOutput('test'),
        footer = NULL
  ),
  panel(title = "Second panel", color = "chardonnay", collapsed = FALSE, width = 350,
        head = NULL,
        body = hotr('hot-table', data = mtcars[1:10,]),
        footer = NULL
  )
)

server <- function(input, output, session) {
  output$test <- renderPrint(input$`hot-table`)
}
shinyApp(ui,server)


