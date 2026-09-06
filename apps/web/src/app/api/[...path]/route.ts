import { NextRequest, NextResponse } from 'next/server';

const API_ORIGIN = process.env.API_PROXY_TARGET ?? 'http://localhost:4000';

async function proxyRequest(
  request: NextRequest,
  path: string,
): Promise<NextResponse> {
  const targetUrl = `${API_ORIGIN}/api/${path}${request.nextUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }

  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers.set('cookie', cookie);
  }

  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.set('authorization', authorization);
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.text(),
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  const setCookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [];

  if (setCookies.length > 0) {
    setCookies.forEach((value) => responseHeaders.append('set-cookie', value));
  } else {
    const singleCookie = response.headers.get('set-cookie');
    if (singleCookie) {
      responseHeaders.set('set-cookie', singleCookie);
    }
  }

  const responseContentType = response.headers.get('content-type');
  if (responseContentType) {
    responseHeaders.set('content-type', responseContentType);
  }

  return new NextResponse(
    response.status === 204 ? null : await response.arrayBuffer(),
    {
      status: response.status,
      headers: responseHeaders,
    },
  );
}

type RouteContext = { params: { path: string[] } };

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path.join('/'));
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path.join('/'));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path.join('/'));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path.join('/'));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path.join('/'));
}
