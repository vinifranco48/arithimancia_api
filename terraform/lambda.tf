resource "aws_lambda_function" "api" {
  filename      = "../dist/function.zip"
  function_name = "${var.project_name}-${var.stage}-api"
  role          = aws_iam_role.lambda_role.arn
  handler       = "lambda.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 1024

  source_code_hash = fileexists("../dist/function.zip") ? filebase64sha256("../dist/function.zip") : null

  environment {
    variables = {
      NODE_ENV               = "production"
      DATABASE_URL           = var.database_url
      JWT_SECRET             = var.jwt_secret
      JWT_ACCESS_EXPIRES_IN  = var.jwt_access_expires_in
      JWT_REFRESH_EXPIRES_IN = var.jwt_refresh_expires_in
    }
  }
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 14
}
