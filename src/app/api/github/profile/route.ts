import { NextResponse } from 'next/server';
import { 
  fetchGitHubUser, 
  getPopularRepos, 
  getRecentRepos, 
  getTotalStars 
} from '@/src/lib/github/api';

export async function GET() {
  try {
    const username = 'seanfilimon';
    
    // Fetch all GitHub data in parallel
    const [user, popularRepos, recentRepos, totalStars] = await Promise.all([
      fetchGitHubUser(username),
      getPopularRepos(username, 4),
      getRecentRepos(username, 4),
      getTotalStars(username)
    ]);

    return NextResponse.json({
      user,
      popularRepos,
      recentRepos,
      totalStars,
    });
  } catch (error) {
    console.error('GitHub API Error:', error);
    
    // Return fallback data
    return NextResponse.json({
      user: {
        login: 'seanfilimon',
        name: 'Sean Filimon',
        avatar_url: '/face_grayscale_nobg.png',
        public_repos: 45,
        followers: 1200,
        following: 328,
        html_url: 'https://github.com/seanfilimon'
      },
      popularRepos: [
        {
          id: 1,
          name: 'seanfilimon',
          full_name: 'seanfilimon/seanfilimon',
          html_url: 'https://github.com/seanfilimon/seanfilimon',
          stargazers_count: 234,
          description: 'Personal profile and portfolio website'
        },
        {
          id: 2,
          name: 'nextjs-saas-starter',
          full_name: 'seanfilimon/nextjs-saas-starter',
          html_url: 'https://github.com/seanfilimon/nextjs-saas-starter',
          stargazers_count: 892,
          description: 'Complete Next.js SaaS boilerplate'
        }
      ],
      recentRepos: [
        {
          id: 3,
          name: 'legionedge-core',
          full_name: 'seanfilimon/legionedge-core',
          html_url: 'https://github.com/seanfilimon/legionedge-core',
          stargazers_count: 423,
          description: 'Core library for LegionEdge platform'
        },
        {
          id: 4,
          name: 'cezium-cli',
          full_name: 'seanfilimon/cezium-cli',
          html_url: 'https://github.com/seanfilimon/cezium-cli',
          stargazers_count: 312,
          description: 'Command line tools for Cezium Software'
        }
      ],
      totalStars: 3200,
    }, { status: 500 });
  }
}
