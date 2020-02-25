#' @title Handsontable wrapper
#'
#' @description
#' Handsontable wrapper for database editing,  controlling configuration and merging data
#'
#' @param inputId The \code{input} slot that will be used to access the value.
#' @param data A data frame object.
#' @param dic  A data frame with labels of data names.
#' @param options A list of initialization options.
#' @return Editable data
#'
#'
#' @examples
#' \dontrun{
#' ## Only run examples in interactive R sessions
#' if (interactive()) {
#'
#' ui <- fluidPage(
#'    uiOutput('dstable'),
#'    verbatimTextOutput('test')
#' )
#' server <- function(input, output) {
#'
#'output$dstable <- renderUI({
#'  hotr("indata1", data = mtcars, options = list(height = 300))
#'})
#'
#'output$test <- renderPrint({
#'  input$indata1
#'})
#' }
#' shinyApp(ui, server)
#' }
#' }
#'
#'
#' @export
hotr <- function(inputId,
                 data = NULL,
                 dic = NULL,
                 options = NULL,
                 enableCTypes = FALSE,
                 ctypes = c('Num', 'Cat', 'Dat', 'Gnm', 'Gcd'),
                 order = NULL, ...){

  if(is.null(data)) return()
  if(shiny::is.reactive(data))
    data <- data()
  defaultOpts <- list(
    maxRows = NULL %||% nrow(data),
    width = NULL,
    manualRowMove = TRUE,
    manualColumnMove = TRUE,
    enableCTypes = enableCTypes,
    ctypes = ctypes
  )

  if (is.null(order)) data <- data
  data <- data %>% dplyr::select(order, everything())


  f <- datafringe::fringe(data)

  options <- modifyList(defaultOpts, options %||% list())

  addResourcePath(
    prefix='handsontable',
    directoryPath=system.file("lib/handsontable",
                              package='hotr'))
  addResourcePath(
    prefix='hotr',
    directoryPath=system.file("lib/hotr",
                              package='hotr'))

  id <- inputId

  data <- f$d



  dic <- dic %||% f$dic_$d
  dic$id <- letters[1:ncol(data)]

  json_opts <- jsonlite::toJSON(options, auto_unbox = TRUE)
  json_table <- jsonlite::toJSON(data, auto_unbox = TRUE)
  json_dic <- jsonlite::toJSON(dic, auto_unbox = TRUE)
  l <- shiny::tagList(
    shiny::singleton(
      shiny::tags$head(
        shiny::tags$link(rel = 'stylesheet',
                         type = 'text/css',
                         href = 'handsontable/handsontable.full.min.css'),
        shiny::tags$script(src = 'handsontable/handsontable.full.min.js')
      )),
    shiny::tags$link(rel = 'stylesheet',
                     type = 'text/css',
                     href = 'hotr/hotr.css'),
    shiny::tags$script(src = 'hotr/hotrHelpers.js'),
    shiny::tags$script(src = 'hotr/hotr.js')
  )

  shiny::div(l,
             id = id,
             nrow = nrow(data),
             ncol = ncol(data),
             class = "hot",
             `data-hotOpts` = htmltools::HTML(json_opts),
             `data-table` = htmltools::HTML(json_table),
             `data-dic` = htmltools::HTML(json_dic))
}

