import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings


class GeminiConfigurationError(Exception):
    pass


class GeminiUpstreamError(Exception):
    pass


def gerar_recomendacao_produto(query):
    if not settings.GEMINI_API_KEY:
        raise GeminiConfigurationError(
            "Configure GEMINI_API_KEY no arquivo backend/.env para habilitar o Gemini."
        )

    prompt = (
        "Ajude a pessoa a avaliar este produto: "
        f'"{query}". Responda em português brasileiro, de forma concisa. '
        "Você não tem acesso à web nesta solicitação. Não afirme que pesquisou lojas e não "
        "invente preços atuais, lojas, disponibilidade, frete ou links. Explique quais "
        "características são importantes e, se apropriado, qual tipo de opção atende melhor "
        "ao produto consultado. Informe que esta é uma orientação geral, não uma cotação atual."
    )
    payload = {
        "model": settings.GEMINI_MODEL,
        "input": prompt,
    }
    request = Request(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": settings.GEMINI_API_KEY,
            "Api-Revision": "2026-05-20",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=45) as response:
            data = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        try:
            error_data = json.loads(error.read().decode("utf-8"))
            message = error_data.get("error", {}).get("message", "")
        except (json.JSONDecodeError, UnicodeDecodeError):
            message = ""
        detail = f"Gemini respondeu com HTTP {error.code}."
        if message:
            detail = f"{detail} {message}"
        raise GeminiUpstreamError(detail) from error
    except (URLError, TimeoutError) as error:
        raise GeminiUpstreamError(
            "Não foi possível conectar ao Gemini. Verifique a conexão e tente novamente."
        ) from error
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise GeminiUpstreamError("O Gemini retornou uma resposta inválida.") from error

    steps = data.get("steps", [])
    answer = "\n\n".join(
        content.get("text", "").strip()
        for step in steps
        if step.get("type") == "model_output"
        for content in step.get("content", [])
        if content.get("type") == "text" and content.get("text", "").strip()
    )
    if not answer:
        raise GeminiUpstreamError("O Gemini não retornou uma recomendação para essa pesquisa.")

    return {"answer": answer, "model": settings.GEMINI_MODEL}
