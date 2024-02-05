import React, { useEffect, useState } from 'react';
import moment from 'moment';
import parse from 'html-react-parser';
import { getArticlePostRes } from '../../helper';
import { onEntryChange } from '../../contentstack-sdk';
import Skeleton from 'react-loading-skeleton';
//import RenderComponents from '../../components/render-components';
import ArchiveRelative from '../../components/archive-relative';
import { ArticlePosts, PageUrl } from "../../typescript/pages";


export default function ArticlePost({ articlePost, pageUrl }: {articlePost: ArticlePosts, pageUrl: PageUrl}) {
  
  const [getPost, setPost] = useState({ post: articlePost });
  async function fetchData() {  
    try {
      const entryRes = await getArticlePostRes(pageUrl);
      console.log(entryRes);
      //const bannerRes = await getPageRes('/article');
      if (!entryRes) throw new Error('Status: ' + 404);
      setPost({ post: entryRes });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, [articlePost]);

  const { post } = getPost;
  return (
    <>
      
      <div className='blog-container'>
        <article className='blog-detail'>
          {post && post.title ? (
            <h2 {...post.$?.title as {}}>{post.title}</h2>            
          ) : (
            <h2>
              <Skeleton />
            </h2>
          )}
          <div className='teaser-article'>
          {post.teaser_banner ? (
            <img
              alt={post.teaser_banner.filename}
              src={post.teaser_banner.url}
              {...post.teaser_banner.$?.url as {}}
            />
          ) : (
            ''
          )}
            </div>
          {post && post.audience ? (
            <h3 {...post.$?.audience as {}}>{post.audience.name} : {post.audience.audience_type}</h3>
            
          ) : (
            <h2>
              <Skeleton />
            </h2>
          )}
          {post && post.event_date ? (
            <p {...post.$?.event_date as {}}>
              {moment(post.event_date).format('ddd, MMM D YYYY')},{' '}
              <strong {...post.author[0].$?.title as {}}>
                {post.author[0].title}
              </strong>
            </p>
          ) : (
            <p>
              <Skeleton width={300} />
            </p>
          )}
          {post && post.description ? (
            <div {...post.$?.description as {}}>{parse(post.description)}</div>
          ) : (
            <Skeleton height={800} width={600} />
          )}
        </article>
      </div>
    </>
  );
}
export async function getServerSideProps({ params }: any) {
  console.log(params.article);
  try {
    //const page = await getPageRes('/article');
    const posts = await getArticlePostRes(`/article/${params.article}`);
    if (!posts) throw new Error('404');

    return {
      props: {
        pageUrl: `/article/${params.article}`,
        articlePost: posts,
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
}
