#!/bin/bash
# filename=Screenshot.png
# filetype='image/png'
token="7SmEB9PIFcLIGEXAUEpB8Jw28TbKSJu2hIkM2CzvNMXO+W7xXgV6ATf8f70EnwioPPkfzDR1y2rGZMi+hJbrlA==";
# token="iufYpsD54OUvYnl0N1ZBZmnAHoknNL+/o2pwk6iGFLKCcuUedlR6OFiCY01QIYDZLcrbF/4SnpfrTWBhsBMLM8mT7AWGbA==";

# endpoint="/private_api/getAllWorkshopsIds"
endpoint="/upload_api"

# url="http://127.0.0.1:5001$endpoint"
# url="http://127.0.0.1:5001/space-messengers/us-central1/app$endpoint"

# server=http://127.0.0.1:5001/space-messengers/us-central1/app
# server=http://127.0.0.1:5000
# https://space-messengers.web.app/
server=https://space-messengers.web.app


url="$server$endpoint"

# url="https://space-messengers.web.app$endpoint"

# https://space-messengers.web.app/private_api/getAllWorkshopsIds

# curl -H "Authorization: Bearer $token" "$url"

# curl "$url" -H "Authorization: Bearer $token"  -F file=@/Users/roy/Desktop/PROYECTOS/AGNES_CHAVEZ/SpaceMessengersHooks/Screenshot.png 
  
  # curl -X POST --data-binary @/Users/roy/Desktop/PROYECTOS/AGNES_CHAVEZ/SpaceMessengersHooks/Screenshot.png \
  #   -H "Authorization: Bearer 7SmEB9PIFcLIGEXAUEpB8Jw28TbKSJu2hIkM2CzvNMXO+W7xXgV6ATf8f70EnwioPPkfzDR1y2rGZMi+hJbrlA==" \
  #   -H "Content-Type: image/png" \
  #   "https://storage.googleapis.com/upload/storage/v1/b/space_messenger_ar/o?uploadType=media&name=testImg2.png"

  curl "$url" -F "file=@/Users/roy/Desktop/PROYECTOS/AGNES_CHAVEZ/SpaceMessengersHooks/Screenshot.png;type=image/png" \
  -H "Authorization: Bearer 7SmEB9PIFcLIGEXAUEpB8Jw28TbKSJu2hIkM2CzvNMXO+W7xXgV6ATf8f70EnwioPPkfzDR1y2rGZMi+hJbrlA==" 
    
    # "https://storage.googleapis.com/upload/storage/v1/b/space_messenger_ar/o?uploadType=media&name=testImg2.png"
