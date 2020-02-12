library(shiny)
library(hotr)
library(datafringe)
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
        body = NULL,
        footer = NULL
  ),
  panel(title = "Second panel", color = "chardonnay", collapsed = FALSE, width = 350,
        head = NULL,
        body = hotr('hot-table', data = mtcars[1:10,]),
        footer = NULL
  )
)

server <- function(input, output, session) {}
shinyApp(ui,server)


