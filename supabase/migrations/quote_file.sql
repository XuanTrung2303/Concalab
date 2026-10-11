-- bucket riêng tư models: giới hạn 50 MB mỗi file
update storage.buckets set file_size_limit = 52428800 where id = 'models';