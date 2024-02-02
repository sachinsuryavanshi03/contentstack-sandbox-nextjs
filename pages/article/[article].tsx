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
        <div className='blog-column-right'>
          <div className='related-post'>
            
            {post && post.related_post ? (
              <ArchiveRelative
                {...post.$?.related_post}
                blogs={post.related_post}
              />
            ) : (
              <Skeleton width={300} height={500} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export async function getServerSideProps({ params }: any) {
  
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
