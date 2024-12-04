export function preprocessImageUrl(itemUrl) {
    console.log('Processing item URL:', itemUrl);
    if (!itemUrl) {
        console.error('URL is null or undefined:', itemUrl);
        throw new Error('Invalid URL: Cannot process');
    }
    let url = itemUrl;
    // Extract the actual S3 URL from the `url` query parameter, or fallback to the raw href
    const s3Url = url.searchParams.get('url');
    const finalUrl = s3Url ? decodeURIComponent(s3Url) : url.href;
    console.log('Processed final URL:', finalUrl);
    return finalUrl;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcGkvc2NyYXBlcnMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxVQUFVLGtCQUFrQixDQUFDLE9BQVk7SUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUU1QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQ25ELE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtJQUNsRCxDQUFDO0lBRUQsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFBO0lBRWpCLHdGQUF3RjtJQUN4RixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN6QyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFBO0lBRTdELE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDN0MsT0FBTyxRQUFRLENBQUE7QUFDbkIsQ0FBQyJ9