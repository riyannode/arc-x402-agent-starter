import { NextResponse } from 'next/server';
import { defaultManifest } from '@/lib/manifest/default-manifest';

/**
 * GET /.well-known/arclayer-agent.json
 *
 * Returns the agent manifest so external builders and discovery services
 * can understand this agent's capabilities, payment config, and supported
 * job lifecycle.
 */
export async function GET() {
  return NextResponse.json(defaultManifest, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
