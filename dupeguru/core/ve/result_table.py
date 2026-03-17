"""dupeGuru video edition result table."""

# 修改前：
from core.gui.result_table import ResultTable

class ResultTable(ResultTable):
    COLUMNS = [
        {'name': 'name', 'display': 'Filename'},
        {'name': 'folder_path', 'display': 'Folder'},
        {'name': 'size', 'display': 'Size (KB)'},
        {'name': 'duration', 'display': 'Duration'},
        {'name': 'dimensions', 'display': 'Dimensions'},
        {'name': 'modified', 'display': 'Modification'},
        {'name': 'video_hash', 'display': 'Video Hash'},
    ]
    DELTA_COLUMNS = {'size', 'duration', 'dimensions'}

# 修改后：
from hscommon.gui.column import Column
from hscommon.trans import trget
from core.gui.result_table import ResultTable as ResultTableBase

coltr = trget("columns")

class ResultTable(ResultTableBase):
    COLUMNS = [
        Column("marked", ""),
        Column("name", coltr("Filename")),
        Column("folder_path", coltr("Folder"), optional=True),
        Column("size", coltr("Size (KB)"), optional=True),
        Column("duration", coltr("Duration"), optional=True),
        Column("dimensions", coltr("Dimensions"), optional=True),
        Column("modified", coltr("Modification"), visible=False, optional=True),
        Column("video_hash", coltr("Video Hash"), visible=False, optional=True),
    ]
    DELTA_COLUMNS = {'size', 'duration', 'dimensions'}