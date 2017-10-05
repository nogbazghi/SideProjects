import urllib2
import re

RE_ALL_DATA  = re.compile('articleBody\'>\n(.+?)\n',re.DOTALL)
Re_groups = re.compile('(<br />)*(.+?)(<br />)|<span.*?>(.+?)<')
segments = re.compile('<h3 class.*?<a href=\'http://learntigrinya.blogspot.com(.+?)<div style=\'clear:.*?/div>', re.DOTALL)
list = ['AFFIRMATIVE FORMS','AFFIRMATIVE FORM','NEGATIVE FORMS','NEGATIVE FORM','EXAMPLES','EXAMPLE']
urlList = ['http://www.learntigrinya.blogspot.com/search?updated-min=2010-01-01T00:00:00-08:00&updated-max=2011-01-01T00:00:00-08:00&max-results=16', 'http://www.learntigrinya.blogspot.com/search?updated-min=2009-01-01T00:00:00-08:00&updated-max=2010-01-01T00:00:00-08:00&max-results=22']
Allsegments = []
for url in urlList:
    request  = urllib2.Request(url)
    response = urllib2.urlopen(request)
    page     = response.read()
    title = re.compile('html\'>(.+?)</a')
    for i in segments.findall(page):
        titler = title.search(i).group(1)
        group = RE_ALL_DATA.search(i).group(1)
        for m in Re_groups.finditer(group):
            word = m.group(2)
            to = word.split('---')
            if len(to) <2: to = word.split('=')
            for sec in to:  sec.strip()
            if word in list: type = word
            else:     Allsegments.append((titler, type, to))

for i in Allsegments:
    print i