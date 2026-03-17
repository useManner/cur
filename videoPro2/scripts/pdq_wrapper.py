def compute_pdq_hash(image_path: str) -> str:
    # 占位实现：实际应调用 PDQ 可执行文件或库
    # 返回伪哈希以便流程跑通
    import hashlib
    return hashlib.sha256(image_path.encode("utf-8")).hexdigest()


