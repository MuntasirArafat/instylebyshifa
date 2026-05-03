import React from 'react'

import Hero from '../component/Hero'
import Products from '../component/Products'
import Offer from '../component/Offer'
import Featured from '../component/Featured'
import Cetagory from '../component/Category'

function page() {
  return (
    <>
      <Hero />
      <Products />
      <Offer />
      <div className=' px-8 '>
        <Featured />
      </div>
    </>
  )
}

export default page
