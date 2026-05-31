export const blockPreview = (name: string, alt: string) => ({
  images: {
    thumbnail: {
      alt,
      url: `/admin/block-previews/${name}.svg`,
    },
  },
})
