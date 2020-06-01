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
                 enable_hdTypes = FALSE,
                 hdTypes = c("Cat","Dat","Num"),
                 order = NULL, ...){

  if(is.null(data)) return()
  if(shiny::is.reactive(data))
    data <- data()
  defaultOpts <- list(
    maxRows = NULL %||% nrow(data),
    width = NULL,
    manualRowMove = TRUE,
    manualColumnMove = TRUE,
    enable_hdTypes = enable_hdTypes,
    hdTypes = hdTypes,
    height = 400
  )

  if (is.null(order)) data <- data
  data <- data %>% dplyr::select(all_of(order), everything())


  #f <- homodatum::fringe(data)
  f <- homodatum::fringe(data, dic = dic)

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

  data <- homodatum::fringe_d(f)
  dic <- homodatum::fringe_dic(f)
  dic$id_letter <- names(data)
  # dic$id <- letters[1:ncol(data)]

  json_opts <- jsonlite::toJSON(options, auto_unbox = TRUE)
  json_table <- jsonlite::toJSON(data, auto_unbox = TRUE)
  # Quick fix. Check with vctrs as JSON
  dic$hdType <- as.character(dic$hdType)
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

#' @export
hotr_table <- function(x, selected = FALSE){
  d <- x$data
  names(d) <- x$dic$label
  if(selected && (nrow(x$selected) > 0)){
    d <- d[,x$selected$label, drop = FALSE]
  }
  d
}

#' @export
hotr_fringe <- function(x, selected = FALSE){
  d <- x$data
  names(d) <- x$dic$label
  if(selected && (nrow(x$selected) > 0)){
    d <- d[,x$selected$label, drop = FALSE]
  }
  homodatum::fringe(x$data, dic = x$dic)
}





